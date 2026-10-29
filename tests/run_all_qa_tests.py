"""
Automated QA Test Runner & Verification Suite
Author: Saloni Jain (Data & Testing Lead)
Project: AI-Based Tech-Stack Recommendation with ERP Integration (SKIT-IOT-2023-2027-096)
Sprint: Sprint 3 / Week 8 Unified Test Pass
"""

import sys
import os
import time

# Ensure project root and ai-service are in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AI_SERVICE_DIR = os.path.join(PROJECT_ROOT, "ai-service")
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if AI_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AI_SERVICE_DIR)

def run_tests_native():
    print("=" * 70)
    print("  SKIT-IOT-2023-2027-096: AUTOMATED QA & TESTING SUITE")
    print("  Lead: Saloni Jain (Data & Testing)")
    print("  Sprint 3 / Week 8: Full Pipeline & Resume Ingestion QA Pass")
    print("=" * 70)

    start_total = time.perf_counter()

    # 1. Test Dataset Schema
    print("\n[SUITE 1/8] Running Dataset Schema & Invariant Tests...")
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
    print("\n[SUITE 2/8] Running Preprocessing QA Tests...")
    from tests.test_preprocessing_qa import TestStudentDataPreprocessor
    preproc_suite = TestStudentDataPreprocessor()
    preproc_suite.test_academic_score_normalization()
    preproc_suite.test_sgpa_normalization()
    preproc_suite.test_clean_skill_dict_canonicalization()
    preproc_suite.test_extracted_feature_vector_dimension(mock_erp, mock_student)
    preproc_suite.test_preprocessor_resilience_to_missing_values()
    print("  -> 5/5 preprocessing unit checks PASSED.")

    # 3. Test Model Inference QA
    print("\n[SUITE 3/8] Running Model Inference & Latency Benchmark Tests...")
    from tests.test_model_inference_qa import TestModelInferenceQA
    model_suite = TestModelInferenceQA()
    model_suite.test_prediction_output_structure(mock_erp, mock_student)
    model_suite.test_top_k_monotonicity()
    model_suite.test_domain_alignment_sanity()
    model_suite.test_cold_start_handling()
    model_suite.test_inference_latency_benchmark()
    print("  -> 5/5 model inference & latency benchmark checks PASSED.")

    # 4. Test API Integration QA
    print("\n[SUITE 4/8] Running API Contract Integration & Edge Case Tests...")
    from tests.test_api_integration_qa import TestApiIntegrationQA
    api_suite = TestApiIntegrationQA()
    api_suite.test_mock_recommendation_response_contract()
    api_suite.test_error_response_contract()
    api_suite.test_boundary_score_recommendation_contract()
    api_suite.test_sparse_cold_start_profile_contract()
    api_suite.test_missing_mandatory_field_error_mapping()
    print("  -> 5/5 API contract & boundary checks PASSED.")

    # 5. Test Explainability & SHAP Attributions QA
    print("\n[SUITE 5/8] Running Explainability (SHAP) QA Tests...")
    from tests.test_explainability_qa import TestExplainabilityQA
    expl_suite = TestExplainabilityQA()
    expl_suite.setUp()
    expl_suite.test_explainability_payload_schema_compliance()
    expl_suite.test_factor_impact_bounds_and_direction()
    expl_suite.test_learning_prerequisites_presence()
    expl_suite.test_explainability_with_extreme_sparse_profile()
    expl_suite.test_all_catalog_stacks_explainable()
    print("  -> 5/5 explainability & attribution invariant checks PASSED.")

    # 6. Test 3-Phase Structured Learning Roadmaps QA
    print("\n[SUITE 6/8] Running 3-Phase Structured Roadmap QA Tests...")
    from tests.test_roadmap_qa import TestRoadmapQA
    roadmap_suite = TestRoadmapQA()
    roadmap_suite.setUp()
    roadmap_suite.test_all_catalog_stacks_have_three_phase_roadmaps()
    roadmap_suite.test_roadmap_phase_schema_invariants()
    roadmap_suite.test_roadmap_integrated_in_prediction_response()
    print("  -> 3/3 roadmap structural & phase invariant checks PASSED.")

    # 7. Test Resume Ingestion & Buffer Safety QA
    print("\n[SUITE 7/8] Running Resume Ingestion & Buffer Safety QA Tests...")
    from tests.test_resume_qa import TestResumeQA
    resume_qa_suite = TestResumeQA()
    resume_qa_suite.setUp()
    resume_qa_suite.test_buffer_memory_isolation_and_zero_disk_persistence()
    resume_qa_suite.test_file_format_boundary_and_extension_validation()
    resume_qa_suite.test_corrupted_and_empty_payload_rejection()
    resume_qa_suite.test_file_size_boundary_enforcement()
    resume_qa_suite.test_pii_and_trace_safety_invariants()
    print("  -> 5/5 resume ingestion & safety checks PASSED.")

    # 8. Test Resume Feature Mapping & Conflict Resolution QA
    print("\n[SUITE 8/8] Running Resume Feature Mapping & Conflict Resolution QA Tests...")
    from tests.test_resume_mapping_qa import TestResumeMappingQA
    mapping_qa_suite = TestResumeMappingQA()
    mapping_qa_suite.setUp()
    mapping_qa_suite.test_canonical_taxonomy_mapping_and_48d_invariance()
    mapping_qa_suite.test_manual_wins_conflict_resolution_invariant()
    mapping_qa_suite.test_erp_academic_score_preservation_invariant()
    mapping_qa_suite.test_sparse_and_empty_resume_fallback_resilience()
    mapping_qa_suite.test_end_to_end_prediction_compatibility_with_merged_profile()
    print("  -> 5/5 resume feature mapping & conflict resolution checks PASSED.")

    total_time = (time.perf_counter() - start_total) * 1000
    print("\n" + "=" * 70)
    print(f"  SUMMARY: 37/37 QA TESTS PASSED SUCCESSFULLY (100% PASS RATE)")
    print(f"  Execution Time: {total_time:.2f} ms")
    print("  Status: All dataset, preprocessor, model inference, API, explainability,")
    print("          roadmap, resume ingestion & conflict resolution checks verified.")
    print("=" * 70)
    return 0

if __name__ == "__main__":
    sys.exit(run_tests_native())
