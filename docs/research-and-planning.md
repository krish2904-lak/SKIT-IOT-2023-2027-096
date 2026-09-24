# Research & Planning

## 1. Project Overview

The project, **AI-Based Tech-Stack Recommendation with ERP Integration**, aims to provide personalized technology-stack recommendations to students.

The system considers student information such as skills, interests, academic performance, ERP data, and resume-derived information to generate suitable technology recommendations.

## 2. Research Objectives

The research and planning phase focuses on:

- Understanding the project requirements.
- Identifying the student information required for recommendations.
- Identifying potential ERP and student data sources.
- Determining the features required by the recommendation model.
- Planning data collection and validation.
- Defining requirements for recommendation testing.
- Establishing a data flow that can support later AI model development and system integration.

## 3. Required Student Data

The following categories of student information were identified as relevant to the recommendation system:

| Data Category | Examples | Purpose |
|---|---|---|
| Academic Information | Courses, grades, academic performance | Understand academic background |
| Technical Skills | Programming languages, frameworks, databases | Identify existing technical capabilities |
| Interests | Areas of interest, preferred domains | Personalize recommendations |
| Project Information | Project type, requirements, technologies used | Match technologies to project needs |
| Resume Information | Skills, projects, experience | Extract additional technical information |
| ERP Information | Relevant academic/student records | Provide structured institutional data |

Only data relevant to the recommendation process should be used.

## 4. Candidate Features

Potential model features identified during planning include:

- Programming language proficiency
- Framework knowledge
- Database knowledge
- Technical domain
- Student interests
- Academic performance
- Existing project experience
- Resume-derived skills
- Project requirements

These features will be refined during the data-preparation phase based on data availability and quality.

## 5. Data Collection Plan

The planned data collection process is:

1. Identify available student and ERP data.
2. Identify required fields and their formats.
3. Collect relevant structured data.
4. Identify missing or inconsistent values.
5. Remove or handle irrelevant information.
6. Standardize values where required.
7. Prepare the validated data for feature engineering and model development.

Personal or unnecessary information should not be included unless it has a defined purpose in the recommendation system.

## 6. Data Validation Considerations

Before model development, the collected data should be checked for:

- Missing values
- Duplicate records
- Invalid values
- Inconsistent naming of skills or technologies
- Incorrect data types
- Outliers where applicable
- Incomplete student profiles

The validation process should ensure that the dataset is consistent and suitable for subsequent model training and testing.

## 7. Recommendation System Flow

The planned high-level data flow is:

Student / ERP Data
        ↓
Data Collection
        ↓
Data Cleaning & Validation
        ↓
Feature Preparation
        ↓
Recommendation Model
        ↓
Technology-Stack Recommendation
        ↓
Recommendation Explanation
        ↓
Dashboard

Resume information can additionally pass through the resume-processing service to extract relevant skills before being used by the recommendation workflow.

## 8. Testing Requirements

The recommendation system should eventually be tested using different input scenarios, including:

- Complete student profiles
- Partially filled profiles
- Different combinations of technical skills
- Different areas of interest
- Different academic backgrounds
- Different project requirements
- Missing or invalid inputs

Testing should verify that the system produces valid and consistent recommendation outputs for supported inputs.

## 9. Planning for Subsequent Development

The research phase establishes the following sequence for subsequent work:

1. Dataset and feature preparation
2. Data validation
3. Recommendation model development
4. Recommendation output validation
5. Backend and frontend integration
6. Functional testing
7. Final system testing and documentation

The data structures and feature definitions should remain sufficiently consistent so that later model and API components can integrate without major restructuring.

## 10. Task 1 Outcome

The research and planning phase established the initial data requirements, candidate features, data collection approach, validation considerations, recommendation workflow, and testing requirements for the project.

These findings provide the basis for the **Data Preparation & AI Prototype** phase.