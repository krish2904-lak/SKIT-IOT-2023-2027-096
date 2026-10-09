"""
Automated QA Test Runner & Verification Suite
Author: Saloni Jain (Data & Testing Lead)
Project: AI-Based Tech-Stack Recommendation with ERP Integration (SKIT-IOT-2023-2027-096)
"""

import sys
import os
import time

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

def run_tests_native():
    print("=" * 70)
    print("  SKIT-IOT-2023-2027-096: AUTOMATED QA & TESTING SUITE")
    print("  Lead: Saloni Jain (Data & Testing)")
    print("=" * 70)

    # 1. Test Dataset Schema
    print("\n[SUITE 1/4] Running Dataset Schema & Invariant Tests...")
    from tests.test_dataset_schema import TestDatasetSchema
    schema_suite = TestDatasetSchema()
    
    mock_erp = {
        "student_id": "STU-2023-096",
        "name": "Test Student",
        "sgpa_sem1": 8.4, "sgpa_sem2": 8.6, "sgpa_sem3": 8.8, "sgpa_sem4": 8.7,
        "cgpa": 8.62, "attendance_percentage": 89.5,
        "dsa_marks": 88, "dbms_marks": 84, "os_marks": 82, "cn_marks": 79
    }
    mock_student = {
        "student_id": "STU-2023-096",
        "domain_interests": ["Web Development"],
        "technical_skills": {"python": 0.85, "javascript": 0.9},
        "certifications_count": 2, "github_projects_count": 4
    }
    mock_stacks = [
        "Full-Stack Web Development", "Mobile Application Development",
        "AI & Machine Learning", "Cloud Computing & DevOps",
        "Cybersecurity & Networks", "Data Science & Analytics",
        "IoT & Embedded Systems"
    ]

    schema_suite.test_erp_record_schema_contains_required_fields(mock_erp)
    schema_suite.test_academic_score_boundaries(mock_erp)
    schema_suite.test_student_input_schema_types(mock_student)
    schema_suite.test_target_tech_stack_classification_classes(mock_stacks)
    print("  -> 4/4 schema invariant checks PASSED.")

    # 2. Test Preprocessing Pipeline
    print("\n[SUITE 2/4] Running Preprocessing QA Tests...")
    from tests.test_preprocessing_qa import TestStudentDataPreprocessor
    preproc_suite = TestStudentDataPreprocessor()
    preproc_suite.test_academic_score_normalization()
    preproc_suite.test_sgpa_normalization()
    preproc_suite.test_clean_skill_dict_canonicalization()
    preproc_suite.test_extracted_feature_vector_dimension(mock_erp, mock_student)
    preproc_suite.test_preprocessor_resilience_to_missing_values()
    print("  -> 5/5 preprocessing unit checks PASSED.")

    # 3. Test Model Inference QA
    print("\n[SUITE 3/4] Running Model Inference & Latency Benchmark Tests...")
    from tests.test_model_inference_qa import TestModelInferenceQA
    model_suite = TestModelInferenceQA()
    model_suite.test_prediction_output_structure(mock_erp, mock_student)
    model_suite.test_top_k_monotonicity()
    model_suite.test_domain_alignment_sanity()
    model_suite.test_cold_start_handling()
    model_suite.test_inference_latency_benchmark()
    print("  -> 5/5 model inference & latency benchmark checks PASSED.")

    # 4. Test API Integration QA
    print("\n[SUITE 4/4] Running API Contract Integration Tests...")
    from tests.test_api_integration_qa import TestApiIntegrationQA
    api_suite = TestApiIntegrationQA()
    api_suite.test_mock_recommendation_response_contract()
    api_suite.test_error_response_contract()
    print("  -> 2/2 API contract checks PASSED.")

    print("\n" + "=" * 70)
    print("  SUMMARY: 16/16 QA TESTS PASSED SUCCESSFULLY (100% PASS RATE)")
    print("  Status: All data validation & model QA checks verified.")
    print("=" * 70)
    return 0

if __name__ == "__main__":
    sys.exit(run_tests_native())
