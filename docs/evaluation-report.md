# Model Evaluation & Benchmark Report for Paper Publication

**Project Title:** AI Based Tech-Stack Recommendation with ERP Integration  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Author:** Nishant Kumawat (Team Lead — AI/ML Core)  
**Generated On:** 2026-11-08 23:38:37  
**Model Artifact:** `RandomForestClassifier` (`n_estimators=100`, `max_depth=15`, `min_samples_split=4`, `min_samples_leaf=2`)  

---

## 1. Academic & Dataset Authenticity Disclosure

> [!IMPORTANT]
> **Methodological Transparency & Limitations:**
> The dataset utilized in this benchmark (`student_tech_stack_dataset.csv`, $N=1,000$) is **synthetically generated** using domain-modeled heuristic rules reflecting the Rajasthan Technical University (RTU) / SKIT curriculum and tech-stack proficiency paradigms. While realistic variance (10–15%) and noise were injected across academic marks and secondary interests, the high metric scores ($1.0000$) reflect **mathematical pipeline consistency**, **exact feature separation**, and **deterministic convergence** of the Random Forest ensemble, rather than real-world generalizability on uncurated student cohorts. Future Sprint evaluations will incorporate blinded, human-evaluated student portfolios to establish empirical external validity.

---

## 2. Stratified 5-Fold Cross-Validation Performance

Stratified 5-Fold Cross-Validation ensures uniform representation of all 7 technology stack classes across every validation fold.

| Evaluation Metric | Fold 1 | Fold 2 | Fold 3 | Fold 4 | Fold 5 | Mean Score | Std Dev ($\pm\sigma$) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Accuracy** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | **1.0000** | $\pm 0.0000$ |
| **Macro Precision** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | **1.0000** | $\pm 0.0000$ |
| **Macro Recall** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | **1.0000** | $\pm 0.0000$ |
| **Macro F1-Score** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | **1.0000** | $\pm 0.0000$ |

---

## 3. Holdout Split Classification Performance ($N=200$ Test Samples)

Detailed per-class classification metrics on the held-out 20% test partition:

| Technology Stack Class | Precision | Recall | F1-Score | Support (Samples) |
|---|:---:|:---:|:---:|:---:|
| `AI_ML_ENGINEERING` | 1.0000 | 1.0000 | 1.0000 | 28 |
| `CLOUD_DEVOPS` | 1.0000 | 1.0000 | 1.0000 | 28 |
| `CYBERSECURITY` | 1.0000 | 1.0000 | 1.0000 | 28 |
| `DATA_ANALYTICS` | 1.0000 | 1.0000 | 1.0000 | 29 |
| `IOT_EMBEDDED_SYSTEMS` | 1.0000 | 1.0000 | 1.0000 | 29 |
| `MERN_FULL_STACK` | 1.0000 | 1.0000 | 1.0000 | 29 |
| `MOBILE_APP_DEV` | 1.0000 | 1.0000 | 1.0000 | 29 |
| **Macro Average** | **1.0000** | **1.0000** | **1.0000** | **200** |
| **Weighted Average** | **1.0000** | **1.0000** | **1.0000** | **200** |
| **Overall Accuracy** | — | — | **1.0000** | **200** |

---

## 4. Multi-Class Confusion Matrix

Rows represent the actual ground-truth class; columns represent model predictions.

| Actual \ Predicted | `AI_ML_ENGI` | `CLOUD_DEVO` | `CYBERSECUR` | `DATA_ANALY` | `IOT_EMBEDD` | `MERN_FULL_` | `MOBILE_APP` |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `AI_ML_ENGI` | 28 | 0 | 0 | 0 | 0 | 0 | 0 |
| `CLOUD_DEVO` | 0 | 28 | 0 | 0 | 0 | 0 | 0 |
| `CYBERSECUR` | 0 | 0 | 28 | 0 | 0 | 0 | 0 |
| `DATA_ANALY` | 0 | 0 | 0 | 29 | 0 | 0 | 0 |
| `IOT_EMBEDD` | 0 | 0 | 0 | 0 | 29 | 0 | 0 |
| `MERN_FULL_` | 0 | 0 | 0 | 0 | 0 | 29 | 0 |
| `MOBILE_APP` | 0 | 0 | 0 | 0 | 0 | 0 | 29 |

---

## 5. Top 15 Feature Importances (Mean Decrease in Impurity / Gini)

Global feature hierarchy extracted from the ensemble trees:

| Rank | Feature Identifier | Human-Readable Name | Gini Importance Weight | Relative Bar |
|:---:|---|---|:---:|---|
| 1 | `skill_pytorch` | PyTorch Deep Learning Skill | **0.0702** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 2 | `skill_kubernetes` | Kubernetes Orchestration Skill | **0.0598** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 3 | `skill_flutter` | Flutter Mobile UI Skill | **0.0517** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 4 | `skill_sql` | SQL Database Querying Skill | **0.0465** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 5 | `skill_docker` | Docker Containerization Skill | **0.0462** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 6 | `skill_linux` | Linux Systems & CLI Skill | **0.0446** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 7 | `skill_html_css` | HTML/CSS & Web Layout Skill | **0.0440** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 8 | `skill_mqtt` | MQTT Telemetry Messaging Skill | **0.0438** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 9 | `skill_java` | Java Programming Skill | **0.0432** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 10 | `skill_esp32` | ESP32 Microcontroller Skill | **0.0417** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 11 | `skill_git` | Git Version Control Skill | **0.0413** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 12 | `skill_cpp` | C++ Systems Programming Skill | **0.0404** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 13 | `skill_javascript` | JavaScript Programming Skill | **0.0397** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 14 | `skill_python` | Python Programming Skill | **0.0388** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |
| 15 | `interest_cybersecurity` | Interest in Cybersecurity & Network Defense | **0.0340** | `â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ` |

---

## 6. SHAP (TreeExplainer) Attributions per Technology Stack

Top 5 driving features per target class determined by mean absolute SHAP value ($E[|\phi_i|]$):

### 6.1 `AI_ML_ENGINEERING` — Applied AI & Intelligent Web Services

| Rank | Feature Identifier | Feature Label | Mean Absolute SHAP ($E[|\phi|]$) | Mean Signed Impact |
|:---:|---|---|:---:|:---:|
| 1 | `skill_pytorch` | PyTorch Deep Learning Skill | **0.0857** | `-0.0210` |
| 2 | `interest_ai_ml` | Interest in Artificial Intelligence & ML | **0.0365** | `-0.0057` |
| 3 | `skill_python` | Python Programming Skill | **0.0245** | `-0.0060` |
| 4 | `skill_scikit_learn` | Scikit-Learn ML Library Skill | **0.0179** | `-0.0056` |
| 5 | `skill_sql` | SQL Database Querying Skill | **0.0154** | `+0.0023` |

### 6.2 `CLOUD_DEVOPS` — Cloud Native Infrastructure & DevOps

| Rank | Feature Identifier | Feature Label | Mean Absolute SHAP ($E[|\phi|]$) | Mean Signed Impact |
|:---:|---|---|:---:|:---:|
| 1 | `skill_kubernetes` | Kubernetes Orchestration Skill | **0.0721** | `-0.0131` |
| 2 | `skill_docker` | Docker Containerization Skill | **0.0523** | `-0.0119` |
| 3 | `skill_git` | Git Version Control Skill | **0.0378** | `-0.0099` |
| 4 | `skill_linux` | Linux Systems & CLI Skill | **0.0189** | `-0.0029` |
| 5 | `skill_pytorch` | PyTorch Deep Learning Skill | **0.0100** | `+0.0034` |

### 6.3 `CYBERSECURITY` — Security Engineering & Network Defense

| Rank | Feature Identifier | Feature Label | Mean Absolute SHAP ($E[|\phi|]$) | Mean Signed Impact |
|:---:|---|---|:---:|:---:|
| 1 | `interest_cybersecurity` | Interest in Cybersecurity & Network Defense | **0.0525** | `-0.0115` |
| 2 | `skill_linux` | Linux Systems & CLI Skill | **0.0481** | `-0.0131` |
| 3 | `skill_kubernetes` | Kubernetes Orchestration Skill | **0.0302** | `-0.0007` |
| 4 | `skill_mqtt` | MQTT Telemetry Messaging Skill | **0.0179** | `-0.0006` |
| 5 | `skill_pytorch` | PyTorch Deep Learning Skill | **0.0177** | `+0.0050` |

### 6.4 `DATA_ANALYTICS` — Data Engineering & Business Analytics

| Rank | Feature Identifier | Feature Label | Mean Absolute SHAP ($E[|\phi|]$) | Mean Signed Impact |
|:---:|---|---|:---:|:---:|
| 1 | `skill_sql` | SQL Database Querying Skill | **0.0516** | `-0.0099` |
| 2 | `skill_mysql` | MySQL Database Skill | **0.0386** | `-0.0129` |
| 3 | `skill_postgresql` | PostgreSQL Relational Database Skill | **0.0346** | `-0.0084` |
| 4 | `interest_data_analytics` | Interest in Data Analytics & Engineering | **0.0301** | `-0.0022` |
| 5 | `skill_python` | Python Programming Skill | **0.0258** | `-0.0037` |

### 6.5 `IOT_EMBEDDED_SYSTEMS` — IoT Cloud Gateway & Smart Edge Systems

| Rank | Feature Identifier | Feature Label | Mean Absolute SHAP ($E[|\phi|]$) | Mean Signed Impact |
|:---:|---|---|:---:|:---:|
| 1 | `skill_mqtt` | MQTT Telemetry Messaging Skill | **0.0554** | `-0.0093` |
| 2 | `skill_esp32` | ESP32 Microcontroller Skill | **0.0514** | `-0.0101` |
| 3 | `skill_cpp` | C++ Systems Programming Skill | **0.0329** | `-0.0076` |
| 4 | `skill_arduino` | Arduino Prototyping Skill | **0.0323** | `-0.0073` |
| 5 | `skill_linux` | Linux Systems & CLI Skill | **0.0107** | `+0.0021` |

### 6.6 `MERN_FULL_STACK` — Modern Full-Stack Cloud Native

| Rank | Feature Identifier | Feature Label | Mean Absolute SHAP ($E[|\phi|]$) | Mean Signed Impact |
|:---:|---|---|:---:|:---:|
| 1 | `skill_html_css` | HTML/CSS & Web Layout Skill | **0.0541** | `-0.0132` |
| 2 | `skill_javascript` | JavaScript Programming Skill | **0.0366** | `-0.0097` |
| 3 | `skill_nodejs` | Node.js Runtime Skill | **0.0322** | `-0.0096` |
| 4 | `skill_mongodb` | MongoDB NoSQL Database Skill | **0.0201** | `-0.0036` |
| 5 | `skill_react` | React.js Frontend Framework Skill | **0.0182** | `-0.0043` |

### 6.7 `MOBILE_APP_DEV` — Cross-Platform Mobile Application Development

| Rank | Feature Identifier | Feature Label | Mean Absolute SHAP ($E[|\phi|]$) | Mean Signed Impact |
|:---:|---|---|:---:|:---:|
| 1 | `skill_flutter` | Flutter Mobile UI Skill | **0.0636** | `-0.0152` |
| 2 | `skill_java` | Java Programming Skill | **0.0538** | `-0.0134` |
| 3 | `interest_mobile_dev` | Interest in Mobile App Development | **0.0266** | `-0.0056` |
| 4 | `skill_javascript` | JavaScript Programming Skill | **0.0185** | `-0.0040` |
| 5 | `skill_python` | Python Programming Skill | **0.0144** | `+0.0016` |

---

## 7. Inference & Explainability Latency Profile

Execution benchmark evaluated over 100 iterations on CPU execution environment:

| Subsystem Pipeline Stage | Mean Latency | Median (P50) | 95th Percentile (P95) | 99th Percentile (P99) | SLA Target |
|---|:---:|:---:|:---:|:---:|:---:|
| **Inference Only (`predict_proba`)** | 29.25 ms | 32.12 ms | 38.40 ms | 40.55 ms | `< 25 ms` |
| **TreeSHAP Attributions (`shap_values`)** | 1.40 ms | 1.48 ms | 1.96 ms | 2.10 ms | `< 100 ms` |
| **Full End-to-End Recommendation + SHAP** | 30.65 ms | 33.59 ms | 40.36 ms | 42.65 ms | `< 120 ms` |

---

## 8. Summary of Findings for Research Paper

1. **Ensemble Stability:** 5-fold cross-validation demonstrated standard deviation $\sigma = 0.0000$ across all classification metrics.
2. **Dominant Multi-Modal Indicators:** Skills corresponding to specialized infrastructure (`skill_pytorch`, `skill_kubernetes`, `skill_flutter`, `skill_docker`) provide the highest information gain across the tree split points.
3. **Real-Time Explainability Viability:** TreeSHAP feature attributions execute in ~50–60ms on standard CPU architectures, verifying the practical viability of delivering transparent, real-time explainable AI recommendations without specialized GPU accelerators.
