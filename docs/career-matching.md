# AIspire Career Matching Engine Specification

This document provides the authoritative mathematical specification and implementation reference for the AIspire Deterministic Career Matching Engine.

---

## 1. Overview & Pedagogical Objective

Unlike black-box AI algorithms that generate arbitrary recommendation percentages, AIspire uses an **explainable, deterministic psychometric model**. Recommendations are calculated purely based on the student's actual responses across the 20 scenario questions, evaluating 7 fundamental cognitive dimensions.

The matching pipeline consists of four sequential stages:
1. **Dimension Score Normalization** (0 to 100)
2. **Weighted Aptitude Compatibility** (0 to 100)
3. **Interest & Goal Alignment** (0 to 100)
4. **Final Composite Compatibility** (85% Aptitude + 15% Interest)

---

## 2. Mathematical Formulations

### Stage 1: Student Dimension Score

For each cognitive dimension $d \in \{\text{Analytical}, \text{Creative}, \text{Technical}, \text{Social/Healthcare}, \text{Management}, \text{Research}, \text{Communication}\}$:

$$\text{StudentScore}[d] = \left( \frac{\text{EarnedWeight}[d]}{\text{MaximumPossibleWeight}[d]} \right) \times 100$$

where:
- $\text{EarnedWeight}[d]$ is the sum of dimension weights contributed by the student's selected options across the 20 assessment questions.
- $\text{MaximumPossibleWeight}[d]$ is the theoretical maximum weight attainable for dimension $d$ across all questions.

**Clamping:**
$$0 \le \text{StudentScore}[d] \le 100$$

If no answers have been provided, $\text{StudentScore}[d] = 0$.

---

### Stage 2: Aptitude Match Calculation

Every career profile specifies benchmark competency weights $w_d \in [0, 1]$ across all 7 dimensions.
The Aptitude Match is the weighted arithmetic mean of the student's dimension scores:

$$\text{AptitudeMatch} = \frac{\sum_{d=1}^{7} \left(\text{StudentScore}[d] \times \text{CareerWeight}[d]\right)}{\sum_{d=1}^{7} \text{CareerWeight}[d]}$$

**Properties:**
- If a student scores $100$ in all dimensions, $\text{AptitudeMatch} = 100$.
- If a student scores $0$ in all dimensions, $\text{AptitudeMatch} = 0$.
- High weights prioritize dimensions critical to that career role (e.g. Technical = 1.0, Analytical = 0.95 for AI Engineers).

---

### Stage 3: Interest & Goal Alignment

Interest alignment captures the student's declared academic interests and open career aspirations:

$$\text{InterestAlignment} \in [10, 100]$$

Calculated by:
1. **Interest Tag Overlap (up to 70 points):** Matching student interests against the career's domain tags and title.
2. **Career Goal Keyword Alignment (up to 30 points):** Matching target goal keywords against career descriptions.
3. If no interests or goals are set by the student, a neutral baseline of $65$ is provided.

---

### Stage 4: Final Match Score

Cognitive aptitude accounts for 85% of the overall recommendation, while expressed interests provide a 15% adjustment:

$$\text{FinalMatch} = (\text{AptitudeMatch} \times 0.85) + (\text{InterestAlignment} \times 0.15)$$

The integer display score is produced by rounding:

$$\text{matchScore} = \text{Math.round}(\text{FinalMatch})$$

$$\text{Clamped to: } 0 \le \text{matchScore} \le 100$$

---

## 3. Explanations & Evidence Generation

### A. "Why This Career" Evidence
For each dimension $d$, the strength evidence metric is:
$$\text{Evidence}[d] = \text{StudentScore}[d] \times \text{CareerWeight}[d]$$
Dimensions are sorted in descending order of evidence. The top two dimensions generate explanatory sentences explaining how the student's specific cognitive traits align with the career's day-to-day demands.

### B. Growth Area Prioritization
Growth areas identify dimensions where improving skills will yield the largest career readiness gains:
$$\text{GrowthPriority}[d] = (100 - \text{StudentScore}[d]) \times \text{CareerWeight}[d]$$
The dimension with the highest growth priority is surfaced with constructive, action-oriented study advice.

---

## 4. Benchmark Example

Suppose a student has:
- `analytical`: 82
- `creative`: 64
- `technical`: 91
- `socialHealthcare`: 48
- `management`: 55
- `research`: 76
- `communication`: 61

For **Full-Stack AI & ML Engineer** with weights:
- `analytical`: 0.95
- `creative`: 0.65
- `technical`: 1.0
- `socialHealthcare`: 0.25
- `management`: 0.45
- `research`: 0.90
- `communication`: 0.55

$$\sum w_d = 0.95 + 0.65 + 1.0 + 0.25 + 0.45 + 0.90 + 0.55 = 4.75$$

$$\sum (\text{Score}_d \times w_d) = 82(0.95) + 64(0.65) + 91(1.0) + 48(0.25) + 55(0.45) + 76(0.90) + 61(0.55)$$
$$= 77.9 + 41.6 + 91.0 + 12.0 + 24.75 + 68.4 + 33.55 = 349.2$$

$$\text{AptitudeMatch} = \frac{349.2}{4.75} \approx 73.5158\%$$

With `InterestAlignment` = 85:
$$\text{FinalMatch} = (73.5158 \times 0.85) + (85 \times 0.15) = 62.4884 + 12.75 = 75.2384\%$$
$$\text{matchScore} = \text{Round}(75.2384) = 75\%$$

