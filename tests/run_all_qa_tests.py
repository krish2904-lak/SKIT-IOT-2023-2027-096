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

    start_total = time.perf_counter()

    # 1. Test Dataset Schema
    print("\n[SUITE 1/6] Running Dataset Schema & Invariant Tests...")
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
    print("\n[SUITE 2/6] Running Preprocessing QA Tests...")
    from tests.test_preprocessing_qa import TestStudentDataPreprocessor
    preproc_suite = TestStudentDataPreprocessor()
    preproc_suite.test_academic_score_normalization()
    preproc_suite.test_sgpa_normalization()
    preproc_suite.test_clean_skill_dict_canonicalization()
    preproc_suite.test_extracted_feature_vector_dimension(mock_erp, mock_student)
    preproc_suite.test_preprocessor_resilience_to_missing_values()
    print("  -> 5/5 preprocessing unit checks PASSED.")

    # 3. Test Model Inference QA
    print("\n[SUITE 3/6] Running Model Inference & Latency Benchmark Tests...")
    from tests.test_model_inference_qa import TestModelInferenceQA
    model_suite = TestModelInferenceQA()
    model_suite.test_prediction_output_structure(mock_erp, mock_student)
    model_suite.test_top_k_monotonicity()
    model_suite.test_domain_alignment_sanity()
    model_suite.test_cold_start_handling()
    model_suite.test_inference_latency_benchmark()
    print("  -> 5/5 model inference & latency benchmark checks PASSED.")

    # 4. Test API Integration QA
    print("\n[SUITE 4/6] Running API Contract Integration & Edge Case Tests...")
    from tests.test_api_integration_qa import TestApiIntegrationQA
    api_suite = TestApiIntegrationQA()
    api_suite.test_mock_recommendation_response_contract()
    api_suite.test_error_response_contract()
    api_suite.test_boundary_score_recommendation_contract()
    api_suite.test_sparse_cold_start_profile_contract()
    api_suite.test_missing_mandatory_field_error_mapping()
    print("  -> 5/5 API contract & boundary checks PASSED.")

    # 5. Test Explainability & SHAP Attributions QA
    print("\n[SUITE 5/6] Running Explainability (SHAP) QA Tests...")
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
    print("\n[SUITE 6/6] Running 3-Phase Structured Roadmap QA Tests...")
    from tests.test_roadmap_qa import TestRoadmapQA
    roadmap_suite = TestRoadmapQA()
    roadmap_suite.setUp()
    roadmap_suite.test_all_catalog_stacks_have_three_phase_roadmaps()
    roadmap_phase_suite_invariants = roadmap_suite.test_roadmap_phase_schema_invariants()
    roadmap_suite.test_roadmap_integrated_in_prediction_response()
    print("  -> 3/3 roadmap structural & phase invariant checks PASSED.")

    total_time = (time.perf_counter() - start_total) * 1000
    print("\n" + "=" * 70)
    print(f"  SUMMARY: 27/27 QA TESTS PASSED SUCCESSFULLY (100% PASS RATE)")
    print(f"  Execution Time: {total_time:.2f} ms")
    print("  Status: All dataset, preprocessor, model inference, API, explainability & roadmap checks verified.")
    print("=" * 70)
    return 0

if __name__ == "__main__":
    sys.exit(run_tests_native())
