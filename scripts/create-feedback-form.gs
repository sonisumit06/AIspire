/**
 * AIspire — Automated Google Feedback Form Generator
 * 
 * Instructions:
 * 1. Open your browser and navigate to https://script.new (or https://script.google.com).
 * 2. Delete any default code in Code.gs and paste this entire file.
 * 3. Click the "Save" icon (Ctrl+S / Cmd+S).
 * 4. Ensure "createAIspireFeedbackForm" is selected in the toolbar function dropdown.
 * 5. Click "Run" ▶️.
 * 6. When prompted, grant permissions (Choose Google Account -> Advanced -> Go to Untitled project -> Allow).
 * 7. Check the "Execution log" at the bottom:
 *    - 🔗 Public Responder URL (Share this with testers & judges)
 *    - ✏️ Form Edit URL (To edit questions or theme)
 *    - 📊 Linked Google Sheet URL (Where all responses sync live)
 */

function createAIspireFeedbackForm() {
  // 1. Create the Form
  var formTitle = 'AIspire — User Experience & Beta Feedback';
  var form = FormApp.create(formTitle);

  form.setDescription(
    'Thank you for trying AIspire! We are building an intelligent, explainable career guidance and roadmap execution platform for students.\n\n' +
    'Your feedback helps us refine our 7D cognitive assessment, career matching accuracy, milestone roadmaps, and AI mentor guidance. This survey takes approximately 3–5 minutes.'
  );

  // 2. Configure Form Settings
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);
  form.setConfirmationMessage('Thank you for your valuable feedback! Your insights directly help us improve AIspire for students worldwide.');

  // ==========================================
  // SECTION 1: Tester Profile & Context
  // ==========================================
  
  // Q1: Current role
  var q1 = form.addMultipleChoiceItem();
  q1.setTitle('What best describes your current role?')
    .setHelpText('Helps segment feedback between high schoolers, college students, educators, and judges.')
    .setRequired(true)
    .setChoiceValues([
      'High School Student (Grade 9–12)',
      'College / Undergraduate Student',
      'Graduate / Early Career Professional',
      'Educator / Career Counselor',
      'Hackathon Judge / Technical Reviewer'
    ])
    .showOtherOption(true);

  // Q2: Access method
  var q2 = form.addMultipleChoiceItem();
  q2.setTitle('How did you access AIspire?')
    .setRequired(false)
    .setChoiceValues([
      'Google Account (Cloud Sync)',
      'Instant Guest Mode'
    ]);

  // Q3: Device & browser
  var q3 = form.addMultipleChoiceItem();
  q3.setTitle('What device and browser did you test on?')
    .setRequired(false)
    .setChoiceValues([
      'Desktop / Laptop (Chrome / Edge / Brave)',
      'Desktop / Laptop (Safari / Firefox)',
      'Mobile / Tablet (iOS)',
      'Mobile / Tablet (Android)'
    ]);

  // ==========================================
  // SECTION 2: 20-Question 7D Cognitive Assessment & Radar
  // ==========================================
  form.addPageBreakItem()
    .setTitle('Section 2: 20-Question 7D Cognitive Assessment & Radar')
    .setHelpText('Evaluates psychometric engagement and visual clarity.');

  // Q4: Engaging and realistic questions
  var q4 = form.addScaleItem();
  q4.setTitle('How engaging and realistic did you find the 20 scenario-based questions?')
    .setBounds(1, 5)
    .setLabels('Very generic / boring', 'Highly realistic & engaging')
    .setRequired(false);

  // Q5: 7D Radar accuracy
  var q5 = form.addMultipleChoiceItem();
  q5.setTitle('Did the 7D Cognitive Radar chart accurately reflect your natural problem-solving strengths?')
    .setHelpText('Assessment Dimensions: Analytical, Creative, Technical, Healthcare/Social, Leadership, Research, Communication')
    .setRequired(false)
    .setChoiceValues([
      'Yes, accurately captured my strengths',
      'Mostly accurate with slight variance',
      'Neutral / Not sure',
      'Inaccurate compared to how I work'
    ]);

  // Q6: Assessment feedback
  var q6 = form.addParagraphTextItem();
  q6.setTitle('Feedback on the assessment experience:')
    .setHelpText('Were questions clear? Did keyboard navigation [1–4 / A–D] work smoothly?')
    .setRequired(false);

  // ==========================================
  // SECTION 3: Career Recommendations & Matching Accuracy
  // ==========================================
  form.addPageBreakItem()
    .setTitle('Section 3: Career Recommendations & Matching Accuracy')
    .setHelpText('Tests the core 85% Aptitude + 15% Interest matching engine.');

  // Q7: Relevance of Top 3 pathways
  var q7 = form.addScaleItem();
  q7.setTitle('How relevant and fitting were your Top 3 recommended career pathways?')
    .setBounds(1, 5)
    .setLabels('Irrelevant', 'Exceptionally well-aligned')
    .setRequired(false);

  // Q8: Why This Career & Growth Areas
  var q8 = form.addMultipleChoiceItem();
  q8.setTitle('Did you find the "Why This Career" evidence and "Growth Areas" clear and constructive?')
    .setRequired(false)
    .setChoiceValues([
      'Very clear and actionable',
      'Clear, but wanted more detailed advice',
      'Neutral',
      'Unclear or contradictory'
    ]);

  // ==========================================
  // SECTION 4: 10-Step Roadmaps, Journey Showcase & Resources
  // ==========================================
  form.addPageBreakItem()
    .setTitle('Section 4: 10-Step Roadmaps, Journey Showcase & Resources')
    .setHelpText('Tests the execution and preparation features.');

  // Q9: 10-Step Roadmap helpfulness
  var q9 = form.addScaleItem();
  q9.setTitle('How helpful is the 10-Step Career Roadmap in breaking down your path into actionable milestones?')
    .setBounds(1, 5)
    .setLabels('Not helpful', 'Extremely practical & clear')
    .setRequired(false);

  // Q10: Journey Showcase experience
  var q10 = form.addMultipleChoiceItem();
  q10.setTitle('How was your experience with the visual Journey Showcase route?')
    .setRequired(false)
    .setChoiceValues([
      'Great visual overview of milestones',
      'Nice to have, but preferred the list view',
      'Needs improvement / distracting',
      'Did not view'
    ]);

  // Q11: Curated Study & Exam Hub
  var q11 = form.addCheckboxItem();
  q11.setTitle('Did you try the Curated Study & Exam Hub?')
    .setRequired(false)
    .setChoiceValues([
      'Searched for syllabus & past papers',
      'Viewed lecture playlists / video courses',
      'Bookmarked resources for later',
      'Did not use the Study Hub'
    ]);

  // Q12: PDF Career Dossier
  var q12 = form.addMultipleChoiceItem();
  q12.setTitle('Did you generate and download the PDF Career Dossier?')
    .setRequired(false)
    .setChoiceValues([
      'Yes — downloaded smoothly and looked publication-ready',
      'Yes — but noticed formatting or styling issues',
      'No — did not test the PDF download'
    ]);

  // ==========================================
  // SECTION 5: AI Career Mentor & Platform Experience
  // ==========================================
  form.addPageBreakItem()
    .setTitle('Section 5: AI Career Mentor & Platform Experience')
    .setHelpText('Tests the AI counsellor and general UI/performance.');

  // Q13: AI Career Mentor rating
  var q13 = form.addScaleItem();
  q13.setTitle('How would you rate your interactions with the AI Career Mentor?')
    .setBounds(1, 5)
    .setLabels('Generic / Unhelpful', 'Contextual, inspiring & actionable')
    .setRequired(false);

  // Q14: UI Design, theme & aesthetics
  var q14 = form.addScaleItem();
  q14.setTitle('How would you rate the overall UI design, theme aesthetics, and responsiveness?')
    .setBounds(1, 5)
    .setLabels('Poor / Cluttered', 'Premium, smooth & cohesive')
    .setRequired(false);

  // Q15: Bugs & performance
  var q15 = form.addParagraphTextItem();
  q15.setTitle('Did you encounter any bugs, display glitches, or slow performance?')
    .setHelpText('Please mention device/screen size and what occurred')
    .setRequired(false);

  // Q16: #1 Feature request
  var q16 = form.addParagraphTextItem();
  q16.setTitle('What is the #1 feature you would like to see added to AIspire next?')
    .setRequired(false);

  // ==========================================
  // 3. Connect to a Live Google Sheet
  // ==========================================
  var sheetTitle = 'AIspire Feedback Responses (Live)';
  var spreadsheet = SpreadsheetApp.create(sheetTitle);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  // ==========================================
  // 4. Output Summary & URLs
  // ==========================================
  var publishedUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();
  var sheetUrl = spreadsheet.getUrl();

  Logger.log('========================================================================');
  Logger.log('✅ AIspire Feedback Form Created Successfully!');
  Logger.log('========================================================================');
  Logger.log('🔗 Public Responder URL (Share this with testers/judges):');
  Logger.log(publishedUrl);
  Logger.log('------------------------------------------------------------------------');
  Logger.log('✏️ Form Edit URL:');
  Logger.log(editUrl);
  Logger.log('------------------------------------------------------------------------');
  Logger.log('📊 Linked Google Sheet URL (Live incoming responses):');
  Logger.log(sheetUrl);
  Logger.log('========================================================================');
}