// script.js

// --- 1. DATA STRUCTURE (SAMPLE - Full implementation requires all categories) ---
const FINDINGS_DATA = {
    'LEFT VENTRICULAR ASSESSMENT': {
        'A. LV Size': [
            { id: 'lv-size-normal', text: 'Normal LV dimensions', isNormal: true },
            { id: 'lv-size-mild-dil', text: 'LV dilatation (mild)', grade: 'mild' },
            { id: 'lv-size-mod-dil', text: 'LV dilatation (moderate)', grade: 'moderate' },
            { id: 'lv-size-sev-dil', text: 'LV dilatation (severe)', grade: 'severe' },
            { id: 'lv-size-small', text: 'Small LV cavity' }
        ],
        'B. LV Function': [
            { id: 'lv-func-normal', text: 'Normal LV systolic function (LVEF >50%)', isNormal: true, measurements: ['LVEF (%)'] },
            { id: 'lv-func-mild-red', text: 'Mildly reduced LV function (LVEF 41-49%)', grade: 'mild', measurements: ['LVEF (%)'] },
            { id: 'lv-func-mod-red', text: 'Moderately reduced LV function (LVEF 31-40%)', grade: 'moderate', measurements: ['LVEF (%)'] },
            { id: 'lv-func-sev-red', text: 'Severely reduced LV function (LVEF ≤30%)', grade: 'severe', measurements: ['LVEF (%)'] },
            { id: 'lv-func-global', text: 'LV systolic dysfunction - global' }
        ],
        'C. LV Diastolic Function': [
            { id: 'diast-func-normal', text: 'Normal diastolic function', isNormal: true, measurements: ['E/A Ratio', 'DT (ms)', "E/e' Ratio"] },
            { id: 'diast-func-grade1', text: 'Grade I diastolic dysfunction (impaired relaxation)', grade: 'mild', measurements: ['E/A Ratio'] },
            { id: 'diast-func-grade2', text: 'Grade II diastolic dysfunction (pseudonormalization)', grade: 'moderate', measurements: ['E/A Ratio'] },
            { id: 'diast-func-grade3', text: 'Grade III diastolic dysfunction (restrictive pattern)', grade: 'severe', measurements: ['E/A Ratio'] },
        ],
        // D, E, F... (similarly structured)
    },
    'MITRAL VALVE ASSESSMENT': {
        'C. Mitral Regurgitation': [
            { id: 'mr-none', text: 'No/trivial mitral regurgitation', isNormal: true },
            { id: 'mr-mild', text: 'Mild mitral regurgitation', grade: 'mild' },
            { id: 'mr-moderate', text: 'Moderate mitral regurgitation', grade: 'moderate' },
            { id: 'mr-severe', text: 'Severe mitral regurgitation', grade: 'severe', requiresMeasurement: true },
            { id: 'mr-primary-degen', text: 'Primary MR (degenerative)' }
        ],
        'D. Prosthetic Mitral Valve': [
            { id: 'pmv-normal', text: 'Normal prosthetic function', isNormal: true },
            { id: 'pmv-stenosis-mod', text: 'Prosthetic stenosis (moderate)', grade: 'moderate', measurements: ['MVA (cm²)', 'Mean Gradient (mmHg)'] }
        ]
    },
    'AORTIC VALVE ASSESSMENT': {
        'Aortic Stenosis Specific': [
            { id: 'as-mild', text: 'Mild AS (Vmax <3 m/s, AVA >1.5 cm²)', grade: 'mild', measurements: ['Vmax (m/s)', 'AVA (cm²)', 'Mean Gradient (mmHg)'] },
            { id: 'as-moderate', text: 'Moderate AS (Vmax 3-4 m/s, AVA 1.0-1.5 cm²)', grade: 'moderate', measurements: ['Vmax (m/s)', 'AVA (cm²)', 'Mean Gradient (mmHg)'] },
            { id: 'as-severe', text: 'Severe AS (Vmax >4 m/s, AVA <1.0 cm²)', grade: 'severe', requiresMeasurement: true, measurements: ['Vmax (m/s)', 'AVA (cm²)', 'Mean Gradient (mmHg)'] }
        ]
    },
    'HEMODYNAMICS': {
        'Pressures': [
            { id: 'hemo-normal', text: 'Normal estimated pressures', isNormal: true },
            { id: 'hemo-pas-mild', text: 'Elevated estimated PASP (mild)', grade: 'mild', measurements: ['PASP (mmHg)'] },
            { id: 'hemo-pas-mod', text: 'Elevated estimated PASP (moderate)', grade: 'moderate', measurements: ['PASP (mmHg)'] },
            { id: 'hemo-lvedp', text: 'Elevated estimated LVEDP', measurements: ['LVEDP (mmHg)'] }
        ]
    }
    // ... all other categories from the prompt must be added here
};

// --- 2. INITIALIZATION AND UI GENERATION ---
document.addEventListener('DOMContentLoaded', () => {
    generateFindingsUI();
    document.getElementById('finding-search').addEventListener('input', filterFindings);
});

/**
 * Generates the dynamic HTML for the READ section based on FINDINGS_DATA.
 */
function generateFindingsUI() {
    const container = document.getElementById('findings-container');
    container.innerHTML = '';

    for (const [category, subcategories] of Object.entries(FINDINGS_DATA)) {
        let categoryHTML = `
            <div class="category-group" data-category="${category}">
                <div class="category-header" onclick="toggleSection(this)">
                    ${category} <span>[+]</span>
                </div>
                <div class="category-content">
        `;

        for (const [subcategory, findings] of Object.entries(subcategories)) {
            categoryHTML += `
                <div class="subcategory-group">
                    <h4>${subcategory}</h4>
            `;

            for (const finding of findings) {
                const gradeClass = finding.grade ? `grade-${finding.grade}` : '';
                const requiredClass = finding.requiresMeasurement ? 'required-finding' : '';
                categoryHTML += `
                    <div class="finding-item ${requiredClass}">
                        <input type="checkbox" id="${finding.id}" name="${finding.id}" 
                               data-text="${finding.text}" 
                               data-category="${category}" 
                               data-subcategory="${subcategory}"
                               ${finding.isNormal ? 'data-is-normal="true"' : ''}
                               onchange="updateSummaryList()">
                        <label for="${finding.id}" class="${gradeClass}">${finding.text}</label>
                    </div>
                `;

                if (finding.measurements) {
                    categoryHTML += `<div id="${finding.id}-measurements" class="measurement-fields" style="display: none;">`;
                    finding.measurements.forEach(m => {
                        categoryHTML += `
                            <div class="form-group">
                                <label for="${finding.id}-${m.replace(/\s/g, '-')}" class="measure-label">${m}</label>
                                <input type="text" id="${finding.id}-${m.replace(/\s/g, '-')}" placeholder="${m}">
                            </div>
                        `;
                    });
                    categoryHTML += `</div>`;
                }
            }
            categoryHTML += '</div>';
        }
        categoryHTML += '</div></div>';
        container.innerHTML += categoryHTML;
    }

    // Attach listener for dynamic measurement field display
    document.querySelectorAll('.finding-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.id;
            const measFields = document.getElementById(`${id}-measurements`);
            if (measFields) {
                measFields.style.display = e.target.checked ? 'grid' : 'none';
            }
        });
    });
}

/**
 * Toggles the expansion state of a findings category section.
 */
function toggleSection(header) {
    const content = header.nextElementSibling;
    const span = header.querySelector('span');
    if (content.style.display === "block") {
        content.style.display = "none";
        span.textContent = "[+]";
    } else {
        content.style.display = "block";
        span.textContent = "[-]";
    }
}

/**
 * Searches and filters the findings based on text input.
 */
function filterFindings() {
    const searchTerm = document.getElementById('finding-search').value.toLowerCase();
    const items = document.querySelectorAll('.finding-item');
    items.forEach(item => {
        const text = item.querySelector('label').textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
            // Also show the parent category/subcategory when a match is found
            item.closest('.category-group').style.display = 'block';
            item.closest('.category-content').style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    // Simple heuristic: if search is empty, hide contents again
    if (!searchTerm) {
        document.querySelectorAll('.category-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.category-header span').forEach(s => s.textContent = '[+]');
        document.querySelectorAll('.category-group').forEach(c => c.style.display = 'block');
    }
}

/**
 * Selects all findings marked as 'isNormal'.
 */
function selectAllNormal() {
    document.querySelectorAll('[data-is-normal="true"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    updateSummaryList();
}

/**
 * Adds a preset template to the recommendations textarea.
 */
function addRecommendationTemplate(text) {
    if (text) {
        document.getElementById('recommendations-text').value += (document.getElementById('recommendations-text').value ? '\n' : '') + text;
    }
}

// --- 3. SUMMARY AND REPORT GENERATION LOGIC ---

/**
 * Updates the summary selection list with currently checked findings.
 */
function updateSummaryList() {
    const summaryList = document.getElementById('summary-findings-list');
    const checked = getSelectedFindings();

    let html = '<h4>Select key findings for SUMMARY:</h4>';
    let summaryText = '';
    let categoryMap = {};

    // Group by category for organized display and summary text
    checked.forEach(finding => {
        if (!categoryMap[finding.category]) {
            categoryMap[finding.category] = [];
        }
        categoryMap[finding.category].push(finding);
    });

    for (const [category, findings] of Object.entries(categoryMap)) {
        html += `
            <h5>${category}</h5>
            <ul>
        `;
        findings.forEach(finding => {
            const fullText = `${finding.text}${finding.measurementsText ? ` (${finding.measurementsText})` : ''}`;
            html += `
                <li>
                    <input type="checkbox" class="summary-checkbox" checked data-summary-text="${fullText}">
                    <label>${fullText}</label>
                </li>
            `;
        });
        html += `</ul>`;
        
        // Auto-format summary statements (simplified)
        summaryText += `${category}: ${findings.map(f => f.text).join(', ')}. `;
    }

    summaryList.innerHTML = html;
    document.getElementById('summary-text').value = summaryText.trim();
}

/**
 * Retrieves all currently selected findings with their measurement values.
 * @returns {Array} List of finding objects.
 */
function getSelectedFindings() {
    const selected = [];
    document.querySelectorAll('.finding-item input:checked').forEach(checkbox => {
        const id = checkbox.id;
        const findingText = checkbox.dataset.text;
        const category = checkbox.dataset.category;

        let measurementsText = '';
        const measFields = document.getElementById(`${id}-measurements`);
        if (measFields) {
            const measures = [];
            measFields.querySelectorAll('input').forEach(input => {
                if (input.value.trim()) {
                    // Extract label text (e.g., LVEF (%))
                    const label = input.previousElementSibling.textContent;
                    measures.push(`${label}: ${input.value.trim()}`);
                }
            });
            if (measures.length > 0) {
                measurementsText = measures.join(', ');
            }
        }

        selected.push({
            id: id,
            category: category,
            text: findingText,
            measurementsText: measurementsText,
            fullText: `${findingText}${measurementsText ? ` (${measurementsText})` : ''}`
        });
    });
    return selected;
}

/**
 * Generates the final structured report text.
 */
function generateReport() {
    const pName = document.getElementById('pName').value;
    const pDOB = document.getElementById('pDOB').value;
    const pStudyDate = document.getElementById('pStudyDate').value;
    const pPerformer = document.getElementById('pPerformer').value;
    const pIndication = document.getElementById('pIndication').value;
    const conclusionText = document.getElementById('conclusion-text').value;
    const recommendationsText = document.getElementById('recommendations-text').value;

    if (!pName || !pPerformer || !pIndication) {
        alert("Please complete the Patient Information and Clinical Indication fields.");
        return;
    }

    const selectedFindings = getSelectedFindings();
    const reportSections = {};

    // Map findings to their main report section (simplified from category names)
    const categoryMap = {
        'LEFT VENTRICULAR ASSESSMENT': 'LEFT VENTRICLE',
        'RIGHT VENTRICULAR ASSESSMENT': 'RIGHT VENTRICLE',
        'ATRIAL ASSESSMENT': 'LEFT ATRIUM / RIGHT ATRIUM',
        'INTERATRIAL SEPTUM': 'INTERATRIAL SEPTUM',
        'MITRAL VALVE ASSESSMENT': 'MITRAL VALVE',
        'TRICUSPID VALVE ASSESSMENT': 'TRICUSPID VALVE',
        'AORTIC VALVE ASSESSMENT': 'AORTIC VALVE',
        'PULMONARY VALVE ASSESSMENT': 'PULMONARY VALVE',
        'AORTIC ROOT AND ASCENDING AORTA': 'AORTIC ROOT/ASCENDING AORTA',
        'DESCENDING AORTA': 'DESCENDING AORTA',
        'PERICARDIUM': 'PERICARDIUM',
        'HEMODYNAMICS': 'HEMODYNAMICS',
        // VSD and SEPTAL ASSESSMENT findings need to be placed under relevant headers in a real system
    };

    // Initialize report sections
    for (const key of Object.values(categoryMap)) {
        reportSections[key] = [];
    }

    // Populate report sections
    selectedFindings.forEach(f => {
        const sectionHeader = categoryMap[f.category] || 'OTHER FINDINGS';
        reportSections[sectionHeader].push(f.fullText);
    });

    // Get final summary text from the editable box, or auto-generate if empty
    let finalSummary = document.getElementById('summary-text').value.trim();
    if (!finalSummary) {
        // Fallback: use selected findings
        finalSummary = selectedFindings.map(f => f.fullText).join('; ');
    }
    
    // Build the final report string
    let report = `
                    BETA CARE CARDIOLOGY SERVICES
                    Structured 2D Echocardiography Report
    
PATIENT INFORMATION:
Name: ${pName}
Date of Birth: ${pDOB}
Date of Study: ${pStudyDate}
Performed By: ${pPerformer}
Clinical Indication: ${pIndication}
    
FINDINGS:
`;

    // Add structured findings
    for (const [section, findings] of Object.entries(reportSections)) {
        const findingsText = findings.length > 0 ? findings.join('; ') : 'Normal / Not Assessed';
        report += `${section}:\n${findingsText}\n\n`;
    }

    report += `
SUMMARY:
${finalSummary}

CONCLUSION:
${conclusionText}

RECOMMENDATIONS:
${recommendationsText}

_________________________________________________
Reported by: ${pPerformer}
Date: ${new Date().toLocaleDateString()}
`;

    document.getElementById('final-report-output').textContent = report.trim();
    document.getElementById('copy-btn').disabled = false;
}

/**
 * Copies the generated report to the clipboard.
 */
function copyReport() {
    const reportText = document.getElementById('final-report-output').textContent;
    navigator.clipboard.writeText(reportText).then(() => {
        alert('Report copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// --- 4. UTILITY (MODAL for reference ranges) ---
function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}
