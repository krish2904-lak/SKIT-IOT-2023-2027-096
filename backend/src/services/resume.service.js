const env = require('../config/env');

function serviceError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

async function parseResume(file, fetchImpl = fetch) {
  const extension = file.originalname.split('.').pop().toLowerCase();
  const allowedTypes = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  if (!allowedTypes[extension] || file.mimetype !== allowedTypes[extension]) {
    throw serviceError('Only matching PDF and DOCX uploads are supported', 415, 'UNSUPPORTED_MEDIA_TYPE');
  }
  if (!file.buffer || file.size < 1) {
    throw serviceError('Resume file must not be empty', 400, 'VALIDATION_ERROR');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw serviceError('Resume must not exceed 5 MB', 413, 'FILE_TOO_LARGE');
  }

  const form = new FormData();
  form.append(
    'file',
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname.replace(/[\r\n]/g, '').slice(0, 180)
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.aiServiceTimeoutMs);

  try {
    const response = await fetchImpl(`${env.aiServiceUrl}/api/v1/resume/parse`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 413) {
        throw serviceError('Resume exceeds the parser size limit', 413, 'FILE_TOO_LARGE');
      }
      if (response.status === 400 || response.status === 422) {
        throw serviceError('Resume could not be parsed', 422, 'VALIDATION_ERROR');
      }
      if (response.status === 503) {
        throw serviceError('Resume parser is unavailable', 503, 'SERVICE_UNAVAILABLE');
      }
      throw serviceError('Resume parser failed', 502, 'UPSTREAM_SERVICE_ERROR');
    }

    let result;
    try {
      result = await response.json();
    } catch (_error) {
      throw serviceError('Resume parser returned invalid JSON', 502, 'UPSTREAM_SERVICE_ERROR');
    }
    if (
      !result
      || !Array.isArray(result.extracted_skills)
      || !Array.isArray(result.extracted_domains)
      || result.extracted_skills.some((skill) =>
        !skill || typeof skill.name !== 'string' || !skill.name.trim())
      || result.extracted_domains.some((domain) => typeof domain !== 'string')
      || !Number.isSafeInteger(result.projects_count)
      || result.projects_count < 0
      || !Number.isSafeInteger(result.certifications_count)
      || result.certifications_count < 0
    ) {
      throw serviceError('Resume parser returned an invalid response', 502, 'UPSTREAM_SERVICE_ERROR');
    }
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw serviceError('Resume parser timed out', 503, 'SERVICE_UNAVAILABLE');
    }
    if (error.statusCode) throw error;
    throw serviceError('Resume parser is unavailable', 503, 'SERVICE_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { parseResume };
