// Seed: Soft Skills course — 7 chapters, each with lessons, slides, and a quiz
// Run: node backend/prisma/seeds/softSkills.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Content ──────────────────────────────────────────────────────────────────

const CHAPTERS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 1: EMOTIONAL INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: 'Emotional Intelligence (EI)',
    description: 'Understand and develop the emotional intelligence skills that underpin compassionate, effective care.',
    lessons: [
      {
        title: 'What is Emotional Intelligence?',
        slides: [
          {
            type: 'TITLE', theme: 'blue',
            title: 'Emotional Intelligence (EI)',
            content: 'The ability to recognise, understand and manage your own emotions — and those of others',
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'The Foundation of Great Care',
            content: 'Emotional Intelligence (EI) shapes how you relate to residents, families, and colleagues every day. It influences how you handle stress, conflict, and compassion.\n\nDeveloping your EI is one of the most powerful investments you can make in your professional life — and in the wellbeing of those you care for.',
          },
        ],
      },
      {
        title: 'Why EI Matters in Healthcare',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'The Stakes Are High',
            content: 'You walk into a new shift to find stressed colleagues, anxious families, and residents who may be confused or in pain. How you respond in those moments defines the quality of care you deliver.\n\nResearch from NHS and Health Education England shows that approximately 90% of patient and family satisfaction comes from how staff communicate, show empathy, and handle emotions — not just from technical skills.',
          },
          {
            type: 'QUOTE', theme: 'dark',
            title: 'NHS Health Education England',
            content: 'The way you make people feel is just as important as what you do for them. In healthcare, emotional care is clinical care.',
          },
        ],
      },
      {
        title: 'The 5 Components of EI',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'blue',
            title: 'The 5 Components',
            bullets: [
              'Self-Awareness — Recognising your emotions as they happen and understanding how they affect your behaviour',
              'Self-Regulation — Managing emotions constructively in challenging or stressful situations',
              'Motivation — Staying driven and positive even when shifts are difficult',
              'Empathy — Genuinely understanding the feelings of residents, families, and colleagues',
              'Social Skills — Building rapport, communicating effectively, and managing relationships',
            ],
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'These Skills Work Together',
            content: 'No single component works in isolation. A care worker with strong self-awareness but poor empathy may understand their own feelings yet fail to connect with residents. A motivated worker without self-regulation may burn out.\n\nThe goal is to develop all five — gradually, with practice and reflection.',
          },
        ],
      },
      {
        title: 'EI in Everyday Practice',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'Three Techniques for Your Next Shift',
            content: 'Name your emotion: Before reacting, silently say "I am feeling frustrated right now." Research shows that naming an emotion reduces its intensity.\n\nUse the 10-second rule: Before responding to a difficult person, pause for 10 seconds. This deliberate pause helps you choose a thoughtful response over a reactive one.\n\nShow empathy with words: Try "I understand this must be very difficult for you. Let me help."',
          },
          {
            type: 'QUOTE', theme: 'dark',
            title: 'Responding to a distressed resident with EI',
            content: 'I understand you are worried about your family — that is completely understandable. Let me find out for you right now.',
          },
        ],
      },
      {
        title: 'Reflect and Apply',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'emerald',
            title: 'After Your Next Shift, Ask Yourself',
            bullets: [
              'Did I introduce myself clearly to every resident I cared for?',
              'Did I listen more than I spoke?',
              'Did I stay calm when I was challenged?',
              'Did I name my emotions to myself when they arose?',
              'Did I show genuine empathy in at least one difficult moment?',
            ],
          },
          {
            type: 'TITLE', theme: 'blue',
            title: 'Key Takeaway',
            content: 'High EI does not mean suppressing your emotions — it means understanding them well enough to choose how you respond. Residents and families feel the difference.',
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'Research shows that approximately what percentage of patient and family satisfaction comes from communication and empathy?',
        options: ['50%', '70%', '90%', '100%'],
        correctAnswer: 2,
        explanation: 'NHS and Health Education England research shows approximately 90% of satisfaction comes from how staff communicate and show empathy — not just technical skills.',
      },
      {
        question: 'Which component of Emotional Intelligence involves managing your feelings constructively during stressful situations?',
        options: ['Empathy', 'Social Skills', 'Self-Awareness', 'Self-Regulation'],
        correctAnswer: 3,
        explanation: 'Self-Regulation is the ability to manage your emotions constructively in challenging situations, rather than reacting impulsively.',
      },
      {
        question: 'A resident is repeatedly asking where their family is. The most emotionally intelligent response is to:',
        options: [
          'Say you are too busy and walk away',
          'Tell them their family visited yesterday',
          'Acknowledge their worry and offer to find out for them',
          'Ask another colleague to deal with it',
        ],
        correctAnswer: 2,
        explanation: 'Acknowledging the resident\'s feelings and taking action shows both empathy and social skills — core components of Emotional Intelligence.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 2: EFFECTIVE COMMUNICATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: 'Effective Communication',
    description: 'Develop the verbal, non-verbal and listening skills that make you a confident and compassionate communicator.',
    lessons: [
      {
        title: 'What is Effective Communication?',
        slides: [
          {
            type: 'TITLE', theme: 'blue',
            title: 'Effective Communication',
            content: 'Clear, honest and compassionate exchange of information — with residents, families, colleagues and the wider care team',
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'Why Every Word — and Silence — Matters',
            content: 'In care settings, poor communication leads to missed care needs, medication errors, family complaints, and staff conflict.\n\nEffective communication is not just about what you say. It includes how you say it, your body language, your tone, and how carefully you listen.',
          },
        ],
      },
      {
        title: 'Verbal and Non-Verbal Communication',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'The Two Channels',
            bullets: [
              'Verbal: The words you choose, your tone of voice, your pace and volume — how you say something is often more important than what you say',
              'Non-Verbal: Eye contact, facial expressions, posture, touch, and physical distance all communicate how you feel about the person',
              'Research suggests up to 55% of emotional meaning is conveyed through facial expression alone',
              'Being aware of both channels makes you a significantly more effective communicator',
            ],
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'Your Non-Verbal Message to Residents',
            content: 'When you crouch to eye level with a resident in a wheelchair, maintain gentle eye contact, and use a calm tone — you communicate respect and safety before you speak a single word.\n\nConversely, crossed arms, avoiding eye contact, or rushing through tasks communicates stress or disinterest — even if your words are kind.',
          },
        ],
      },
      {
        title: 'Active Listening',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'What Active Listening Really Means',
            content: 'Active listening is the full concentration on what is being said — rather than preparing your response while the other person is still talking.\n\nMost people listen at about 25% efficiency. Distracted listening leads to misunderstood care needs, missed concerns, and residents and families feeling unheard.',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'How to Listen Actively',
            bullets: [
              'Give your full attention — put down what you are doing when a resident needs to talk',
              'Use open body language — face the person, make eye contact, nod to show understanding',
              'Do not interrupt — let them finish before you respond',
              'Reflect back — "So if I understand correctly, you are saying...?"',
              'Ask open questions — "Can you tell me more about that?" rather than yes/no questions',
            ],
          },
        ],
      },
      {
        title: 'Difficult Conversations',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'When Communication Gets Hard',
            content: 'Distressed families, frustrated colleagues, and confused residents all require a different communication approach.\n\nThe biggest mistake in difficult conversations is trying to fix or correct too quickly. Before offering any information or solution, always acknowledge the other person\'s feelings first.\n\nThis simple shift — feelings first, facts second — dramatically reduces conflict and builds trust.',
          },
          {
            type: 'QUOTE', theme: 'dark',
            title: 'Responding to an anxious family member',
            content: 'I can see how worried you are, and I completely understand. Let me find out exactly what is happening and come back to you within ten minutes.',
          },
        ],
      },
      {
        title: 'Communication Best Practices',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Good Communication on Every Shift',
            bullets: [
              'Handovers: Be precise — use SBAR structure (Situation, Background, Assessment, Recommendation)',
              'With residents: Use their preferred name, speak clearly and patiently, always check understanding',
              'With families: Be honest, empathetic and consistent in what you communicate',
              'Escalation: Speak up early — if something does not feel right, say so clearly',
              'Documentation: If it is not written down, it did not happen',
            ],
          },
          {
            type: 'TITLE', theme: 'emerald',
            title: 'Key Takeaway',
            content: 'The most effective communicators in care are not the most talkative — they are the most present, the most honest, and the most compassionate.',
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'Active listening means:',
        options: [
          'Waiting for your turn to speak',
          'Preparing your response while the other person is still talking',
          'Giving full attention and responding to what is actually being said',
          'Only listening when the topic seems important',
        ],
        correctAnswer: 2,
        explanation: 'Active listening requires full concentration on what is being said — not thinking about your response while the other person is speaking.',
      },
      {
        question: 'When communicating with a distressed family member, the most effective first step is to:',
        options: [
          'Immediately explain the medical facts',
          'Ask them to come back when a manager is available',
          'Acknowledge their feelings before providing any information',
          'Reassure them that everything is fine',
        ],
        correctAnswer: 2,
        explanation: 'Feelings-first communication — acknowledging emotions before offering facts — reduces distress and builds trust far more effectively than jumping straight to information.',
      },
      {
        question: 'Non-verbal communication includes:',
        options: [
          'The words you choose to say',
          'Email and written messages',
          'Your tone, facial expressions and body language',
          'Official care plans and documentation',
        ],
        correctAnswer: 2,
        explanation: 'Non-verbal communication encompasses everything beyond the literal words spoken — tone of voice, posture, facial expressions, eye contact, and physical distance.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 3: CRITICAL THINKING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: 'Critical Thinking',
    description: 'Learn to observe carefully, question assumptions, and make sound decisions — especially under pressure.',
    lessons: [
      {
        title: 'What is Critical Thinking?',
        slides: [
          {
            type: 'TITLE', theme: 'blue',
            title: 'Critical Thinking',
            content: 'The ability to gather information, question assumptions, evaluate evidence and make sound, reasoned decisions — especially under pressure',
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'More Than Just Thinking Hard',
            content: 'Critical thinking is not about being sceptical or doubting everything. It is a structured approach to decision-making that helps you avoid errors, spot concerns early, and act safely.\n\nIn care homes, it can be the difference between a near-miss and a serious incident.',
          },
        ],
      },
      {
        title: 'Why Critical Thinking Matters in Care',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'Care is Complex and Fast-Moving',
            content: 'Every shift brings unexpected situations: a resident whose behaviour has changed, a medication instruction that does not seem right, a colleague who seems overwhelmed.\n\nWithout critical thinking, it is easy to default to routine — which can mask real risks. Critical thinking means asking: "What am I observing? What could it mean? What should I do?"',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'The Cost of Not Thinking Critically',
            bullets: [
              'Care needs go unnoticed because warning signs are dismissed as normal',
              'Errors are repeated because no one questions established practice',
              'Staff remain silent about concerns because "it is probably nothing"',
              'Residents are harmed by assumptions rather than properly assessed needs',
            ],
          },
        ],
      },
      {
        title: 'The STOP Framework',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'blue',
            title: 'A Framework for Sound Decisions',
            bullets: [
              'S — Stop: Pause before acting. Rushing into action without thought increases the risk of error.',
              'T — Think: What am I observing? What are the possible explanations? What is at stake?',
              'O — Options: What can I do? What are the consequences of each option I have?',
              'P — Proceed: Take the most appropriate action — then document what you did and why.',
            ],
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'STOP in Practice',
            content: 'A resident who is usually chatty is unusually quiet this morning.\n\nStop: Do not rush past this observation.\nThink: Could this be tiredness, pain, low mood, or early deterioration?\nOptions: Check in verbally, take observations, inform a senior colleague, document.\nProceed: Do all of the above — do not wait and see.',
          },
        ],
      },
      {
        title: 'Recognising Bias in Your Thinking',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'Your Brain Takes Shortcuts',
            content: 'Cognitive biases are mental shortcuts that help us make fast decisions — but they can lead us astray in care settings.\n\nFor example: you might dismiss a resident\'s complaint because they "always complain". Or assume an experienced colleague\'s decision must be right without questioning it. These are biases — and they can cause harm.',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Common Biases in Care Settings',
            bullets: [
              'Confirmation bias: Looking for evidence that confirms what you already believe',
              'Anchoring: Sticking to a first impression even when new information suggests otherwise',
              'Authority bias: Assuming senior staff or doctors are always correct',
              'Availability bias: Over-weighting recent or memorable events in your decision-making',
              'Status quo bias: Resisting change because "that is how things are done here"',
            ],
          },
        ],
      },
      {
        title: 'Build Your Critical Thinking Habit',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Practical Steps',
            bullets: [
              'Ask "Why?" at least once per shift — about a procedure, a care plan, or an instruction',
              'Use reflective practice: after incidents, ask what you noticed, thought, and would do differently',
              'Speak up early — if something does not feel right, say so professionally and clearly',
              'Seek evidence — when unsure, check the care plan, policies, or ask a knowledgeable colleague',
              'Reflect without ruminating — learn from decisions without excessive self-blame',
            ],
          },
          {
            type: 'TITLE', theme: 'blue',
            title: 'Key Takeaway',
            content: 'Critical thinking is not about being difficult — it is about being safe. The best care workers ask questions, notice details, and act with confidence when something is not right.',
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'In the STOP critical thinking framework, what does the "T" stand for?',
        options: ['Track', 'Think', 'Tell', 'Test'],
        correctAnswer: 1,
        explanation: 'STOP stands for Stop (pause before acting), Think (assess what you are observing and what it could mean), Options (consider available actions), and Proceed (act and document).',
      },
      {
        question: 'Confirmation bias in care means:',
        options: [
          'Double-checking care plans before acting',
          'Looking for evidence that confirms your existing belief, even when it may be wrong',
          'Confirming decisions with a senior colleague before proceeding',
          'Being confident in your own clinical skills',
        ],
        correctAnswer: 1,
        explanation: 'Confirmation bias is the tendency to search for information that supports what we already believe, which can cause us to miss important contradicting evidence.',
      },
      {
        question: 'A resident who is usually cheerful is unusually withdrawn today. The critically thinking response is to:',
        options: [
          'Assume they are tired and carry on with your tasks',
          'Wait until end of shift before mentioning it',
          'Observe carefully, take appropriate action, and document',
          'Ask another resident whether they noticed anything',
        ],
        correctAnswer: 2,
        explanation: 'Unexplained changes in a resident\'s behaviour or presentation are always worth investigating, documenting and escalating to a senior colleague where appropriate.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 4: RESILIENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: 'Resilience',
    description: 'Build the inner strength and practical strategies to sustain your wellbeing through the demands of care work.',
    lessons: [
      {
        title: 'What is Resilience?',
        slides: [
          {
            type: 'TITLE', theme: 'blue',
            title: 'Resilience',
            content: 'The ability to adapt, recover and continue functioning effectively in the face of stress, adversity, and challenge — without compromising your wellbeing',
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'What Resilience is NOT',
            content: 'Resilience is not about being tough, emotionless, or working through exhaustion without complaint.\n\nIt is not "just getting on with it". True resilience includes knowing your limits, asking for help, maintaining healthy boundaries, and engaging in consistent self-care.\n\nThe most resilient care workers are not those who never struggle — they are those who recover, reflect, and return.',
          },
        ],
      },
      {
        title: 'Resilience in a Demanding Workplace',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'Why Care Work Tests Resilience',
            content: 'Care work is emotionally intense. You regularly encounter suffering, death, family distress, moral complexity, and workplace pressure — often within the same shift.\n\nWithout resilience strategies, these demands accumulate. Research shows care workers are among the highest-risk groups for burnout, compassion fatigue, and stress-related illness — which ultimately affects the quality of care provided.',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'What Erodes Resilience at Work',
            bullets: [
              'Chronic understaffing and role overload without adequate support',
              'Lack of recognition, feedback, or acknowledgement of effort',
              'Poor team communication and unresolved interpersonal conflict',
              'Exposure to repeated trauma or grief without access to debrief',
              'Feeling that raising concerns leads to no meaningful change',
            ],
          },
        ],
      },
      {
        title: 'Recognising Burnout Before It Happens',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'Burnout: The Warning Signs',
            content: 'Burnout does not happen overnight. It develops gradually through sustained stress without adequate recovery. Recognising the early signs in yourself — or a colleague — is one of the most important things you can do.\n\nBurnout affects not just how you feel, but how you care for others. Research links burnout directly with increased medication errors, reduced patient safety, and higher staff turnover.',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Warning Signs to Watch For',
            bullets: [
              'Persistent exhaustion that does not improve after rest',
              'Emotional detachment — going through the motions without genuine engagement',
              'Reduced effectiveness and difficulty concentrating at work',
              'Increased cynicism about residents, colleagues, or the job itself',
              'Physical symptoms: headaches, sleep problems, or frequent illness',
              'Dreading going to work, or feeling numb during your shift',
            ],
          },
        ],
      },
      {
        title: 'Building Your Resilience Toolkit',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Strategies That Work',
            bullets: [
              'Build a support network: Trust a small group of colleagues or friends you can debrief with',
              'Use structured reflection: Brief end-of-shift notes help you process difficult experiences',
              'Set realistic boundaries: Saying no when appropriate is a professional skill, not a weakness',
              'Protect your recovery: Sleep, nutrition, movement and rest are professional tools, not luxuries',
              'Celebrate small wins: Notice what went well — not only what went wrong',
            ],
          },
          {
            type: 'QUOTE', theme: 'dark',
            title: 'A principle of sustainable care',
            content: 'You cannot pour from an empty cup. Taking care of yourself is not selfish — it is what allows you to take care of others.',
          },
        ],
      },
      {
        title: 'Staying Well at Work',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'emerald',
            title: 'Your Wellbeing Self-Check',
            bullets: [
              'Am I getting enough sleep and recovery time between shifts?',
              'Am I talking to someone when shifts are difficult, rather than bottling things up?',
              'Am I aware of the support available to me through my employer?',
              'Am I recognising and managing my stress before it becomes burnout?',
              'Am I showing the same compassion to myself that I show to the people I care for?',
            ],
          },
          {
            type: 'TITLE', theme: 'blue',
            title: 'Key Takeaway',
            content: 'Resilience is a skill that can be built and maintained. By investing in your own wellbeing, you protect your ability to deliver compassionate, safe, and consistent care — over the long term.',
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'Resilience in the workplace is best described as:',
        options: [
          'Never showing emotion at work',
          'Being able to recover from setbacks while maintaining your wellbeing',
          'Pushing through exhaustion without asking for help',
          'Ignoring personal difficulties when you are at work',
        ],
        correctAnswer: 1,
        explanation: 'True resilience involves adapting and recovering from challenges while maintaining your wellbeing — not suppressing emotions, ignoring limits, or working through harm.',
      },
      {
        question: 'Which of the following is a recognised early warning sign of burnout?',
        options: [
          'Feeling tired after a long shift',
          'Looking forward to your days off',
          'Emotional detachment and reduced effectiveness at work',
          'Asking for help with complex or unfamiliar tasks',
        ],
        correctAnswer: 2,
        explanation: 'Emotional detachment and reduced effectiveness are key early signs of burnout — distinct from the normal tiredness that comes with a demanding but manageable workload.',
      },
      {
        question: 'Building resilience at work includes:',
        options: [
          'Avoiding other staff to protect your own energy',
          'Pretending everything is fine to appear professional',
          'Building a support network and practising self-reflection',
          'Only focusing on work tasks and keeping personal concerns separate',
        ],
        correctAnswer: 2,
        explanation: 'Resilience is actively built through connection, reflection, self-awareness, and self-care — not through isolation, suppression, or compartmentalisation.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 5: TRANSFORMATIONAL LEADERSHIP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: 'Transformational Leadership',
    description: 'Discover how every care worker can lead through integrity, empathy, and a commitment to raising standards.',
    lessons: [
      {
        title: 'What is Transformational Leadership?',
        slides: [
          {
            type: 'TITLE', theme: 'blue',
            title: 'Transformational Leadership',
            content: 'A style of leadership that inspires and motivates others through vision, integrity and empathy — regardless of job title or seniority',
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'Leadership is Not a Job Title',
            content: 'You do not need to be a manager to be a leader. Transformational leadership is about the way you show up — your attitude, your example, and your impact on those around you.\n\nEvery care worker who mentors a colleague, raises a safety concern, or maintains high standards under pressure is practising transformational leadership.',
          },
        ],
      },
      {
        title: 'Why Leadership Matters in Care',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'The Ripple Effect of Good Leadership',
            content: 'Research consistently shows that teams led by transformational leaders deliver better patient outcomes, have lower turnover rates, and report higher job satisfaction.\n\nIn care settings, where teams often work under significant pressure with high emotional demands, leadership quality directly affects resident wellbeing and staff retention.',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'The Cost of Poor Leadership in Care',
            bullets: [
              'Safety incidents go unreported because staff fear blame or dismissal',
              'New staff feel unsupported and leave within their first six months',
              'High-performing staff become disengaged and lower their own standards',
              'Residents receive inconsistent care because the team lacks clear direction',
              'Staff wellbeing deteriorates in an environment that does not value people',
            ],
          },
        ],
      },
      {
        title: 'The Core Qualities of a Leader',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'blue',
            title: 'Six Core Qualities',
            bullets: [
              'Integrity: Doing the right thing — especially when no one is watching',
              'Vision: Seeing not just what is, but what could be better',
              'Empathy: Understanding the needs and challenges of colleagues and residents',
              'Accountability: Taking ownership of your actions and their outcomes',
              'Communication: Speaking clearly, honestly and respectfully with everyone',
              'Development: Supporting others to grow — mentoring, encouraging, sharing knowledge',
            ],
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'Integrity in Practice',
            content: 'Integrity means that your values and your actions are aligned — consistently.\n\nIn care, integrity looks like: accurately documenting what you observed, even when it reflects a mistake. Raising a concern professionally, even when it involves a senior colleague. Maintaining confidentiality at all times.\n\nThis is the foundation of trust — and trust is the foundation of good care.',
          },
        ],
      },
      {
        title: 'Leading by Example Every Shift',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'Informal Leadership Moments',
            content: 'Transformational leadership happens in small moments:\n\nWhen you greet a new colleague and offer to help them settle in.\nWhen you stay calm during a chaotic shift — and your calm becomes contagious.\nWhen you speak up in a team meeting because you noticed something important.\nWhen you complete documentation thoroughly even when you are tired.\n\nThese are leadership acts. Residents and colleagues notice every one of them.',
          },
          {
            type: 'QUOTE', theme: 'dark',
            title: 'Ray Kroc',
            content: 'The quality of a leader is reflected in the standards they set for themselves.',
          },
        ],
      },
      {
        title: 'Your Leadership in Action',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Five Leadership Habits to Start Today',
            bullets: [
              'Mentor one colleague: Share something you have learned or offer support to someone newer',
              'Raise one concern: If you see a risk, report it — safely and professionally',
              'Set one standard: Commit to doing one thing exceptionally well this week',
              'Recognise one colleague: Acknowledge good work — it costs nothing and means everything',
              'Reflect on your impact: At the end of your shift, ask "How did I make others feel today?"',
            ],
          },
          {
            type: 'TITLE', theme: 'emerald',
            title: 'Key Takeaway',
            content: 'Transformational leadership is not about having authority — it is about having integrity. The impact you have on residents, families and colleagues every day is your leadership legacy.',
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'Transformational leadership is best described as:',
        options: [
          'Strictly enforcing rules and procedures at all times',
          'Leading only when you hold a formal management title',
          'Inspiring others through integrity, empathy and a commitment to excellence',
          'Managing staff primarily through rewards and consequences',
        ],
        correctAnswer: 2,
        explanation: 'Transformational leaders inspire others through who they are and how they behave — not through position, authority, or a system of rewards and punishments.',
      },
      {
        question: 'As a care worker without a management title, you can demonstrate leadership by:',
        options: [
          'Only following instructions and avoiding additional responsibility',
          'Speaking up about safety concerns and mentoring newer colleagues',
          'Telling senior staff how they should do their jobs',
          'Waiting to be formally asked before taking any initiative',
        ],
        correctAnswer: 1,
        explanation: 'Leadership is expressed through everyday actions — maintaining high standards, mentoring colleagues, and raising concerns responsibly. It does not require a management title.',
      },
      {
        question: 'Which quality is most central to transformational leadership?',
        options: [
          'Strict enforcement of all policies and procedures',
          'Keeping key decisions to yourself to maintain authority',
          'Acting with integrity — consistently doing the right thing',
          'Maintaining professional distance from colleagues at all times',
        ],
        correctAnswer: 2,
        explanation: 'Integrity — consistently aligning your values with your actions — is the foundation of transformational leadership. It is what builds the trust that makes leadership possible.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 6: ADAPTABILITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: 'Adaptability',
    description: 'Develop the flexibility and growth mindset needed to thrive in the constantly changing environment of healthcare.',
    lessons: [
      {
        title: 'What is Adaptability?',
        slides: [
          {
            type: 'TITLE', theme: 'blue',
            title: 'Adaptability',
            content: 'The ability to adjust effectively to new conditions, changing priorities, and unexpected challenges — without losing focus on what matters most',
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'The Adaptable Care Worker',
            content: 'Care environments are inherently unpredictable. A resident\'s condition changes. A colleague calls in sick. A new protocol is introduced. A family member arrives and changes the care dynamic.\n\nAdaptability is what separates a care worker who thrives in that environment from one who becomes overwhelmed by it. It is not a personality trait — it is a skill that can be developed.',
          },
        ],
      },
      {
        title: 'Why Adaptability Matters in Care',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'The Constant State of Change',
            content: 'In care settings, change is not the exception — it is the norm.\n\nResidents\' needs change daily. Policies update. Staff configurations shift. Technology evolves. Regulatory requirements tighten.\n\nThe care worker who embraces change rather than resisting it is more effective, more valued, more resilient, and better protected from workplace stress.',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'What Happens When Adaptability is Low',
            bullets: [
              'Small changes feel overwhelming and trigger disproportionate stress',
              'Time and energy are lost resisting change rather than working with it',
              'Colleagues and residents are affected by your visible frustration',
              'Opportunities to improve care are missed because familiarity feels safer',
              'You become a source of friction rather than a source of stability in the team',
            ],
          },
        ],
      },
      {
        title: 'The Adaptable Mindset',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'Fixed vs Growth Mindset',
            content: 'A fixed mindset says: "That is not how we do it here." It sees challenges as threats.\n\nA growth mindset says: "This is a challenge — what can I learn from it?" It sees change as an opportunity to develop.\n\nResearch by psychologist Carol Dweck shows that people with growth mindsets perform significantly better in complex, high-pressure roles — including care.',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Signs of an Adaptable Mindset',
            bullets: [
              'You stay calm rather than reactive when plans suddenly change',
              'You ask "What do I need to learn?" rather than "Why is this happening to me?"',
              'You look for the opportunity in a difficult situation',
              'You try new approaches willingly rather than insisting on familiar methods',
              'You accept feedback as useful information, not personal criticism',
            ],
          },
        ],
      },
      {
        title: 'Adapting in Real Situations',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'A Scenario to Consider',
            content: 'You arrive for a day shift and are immediately told the ward plan has changed: two colleagues are off sick, a new resident has been admitted, and there is a family meeting in 90 minutes you were not briefed on.\n\nA low-adaptability response: frustration, complaint, withdrawal.\n\nA high-adaptability response: quickly re-prioritise tasks, request a brief handover on the new resident, clarify what is needed for the family meeting. Stay focused on residents — not the disruption.',
          },
          {
            type: 'QUOTE', theme: 'dark',
            title: 'Charles Darwin',
            content: 'It is not the strongest of the species that survives, nor the most intelligent — but the one most responsive to change.',
          },
        ],
      },
      {
        title: 'Cultivate Your Adaptability',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Building Adaptability Over Time',
            bullets: [
              'Volunteer for new tasks or unfamiliar situations — discomfort is where growth happens',
              'When something changes, ask "What can I control?" and focus your energy there',
              'Seek feedback regularly — every piece of feedback is a chance to adapt and improve',
              'Observe highly adaptable colleagues and notice how they reframe challenges',
              'After difficult shifts, ask: "What would I do differently next time?"',
            ],
          },
          {
            type: 'TITLE', theme: 'blue',
            title: 'Key Takeaway',
            content: 'Adaptability is not about ignoring your feelings when things change — it is about choosing your response. The care worker who stays flexible, curious and calm in uncertainty is an asset to every team.',
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'Adaptability in a care setting primarily means:',
        options: [
          'Always agreeing with decisions made by managers',
          'Resisting change to maintain established and familiar standards',
          'Adjusting your approach effectively when circumstances or priorities change',
          'Doing the same tasks in the same way regardless of what is needed',
        ],
        correctAnswer: 2,
        explanation: 'Adaptability is the ability to adjust your approach effectively when the situation requires it — a critical skill in the dynamic and unpredictable environment of care.',
      },
      {
        question: 'A growth mindset, as described by psychologist Carol Dweck, is best described as:',
        options: [
          'Believing your abilities are fixed and cannot change significantly',
          'Focusing only on tasks you already perform well',
          'Believing skills can be developed through effort, learning and feedback',
          'Avoiding challenges in order to protect your self-confidence',
        ],
        correctAnswer: 2,
        explanation: 'A growth mindset is the belief that abilities can be developed through dedication and hard work — leading to better performance in complex, changing environments like care.',
      },
      {
        question: 'Your shift plan changes unexpectedly due to staff absences. The most adaptable response is to:',
        options: [
          'Complain to other colleagues about the unfairness of the change',
          'Refuse tasks that fall outside your usual role description',
          'Stay calm, re-prioritise quickly, and focus on what residents need',
          'Wait for your manager to resolve the situation before doing anything',
        ],
        correctAnswer: 2,
        explanation: 'High adaptability means staying calm, reassessing priorities quickly, and redirecting focus to the most important outcome — the needs of the residents in your care.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 7: CULTURAL COMPETENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    title: 'Cultural Competence',
    description: 'Learn to provide respectful, personalised care that honours the cultural identity of every resident and colleague.',
    lessons: [
      {
        title: 'What is Cultural Competence?',
        slides: [
          {
            type: 'TITLE', theme: 'blue',
            title: 'Cultural Competence',
            content: 'The ability to understand, respect and effectively respond to the cultural backgrounds, beliefs and individual needs of residents, families and colleagues',
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'Why Culture Shapes Care',
            content: 'Culture influences how people understand illness, how they communicate pain and discomfort, what they eat, how they relate to authority, their religious practices, and their experience of death and dying.\n\nA care worker who is culturally competent understands that personalised, dignified care requires awareness of these differences — and the humility to ask when unsure.',
          },
        ],
      },
      {
        title: 'Culture and Care',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Cultural Factors That Affect Care',
            bullets: [
              'Communication style: Some cultures communicate pain indirectly or avoid disagreeing with those in authority',
              'Dietary requirements: Religious and cultural dietary needs must be respected and accurately met',
              'Privacy and modesty: Some residents require same-gender personal care — always ask',
              'Family involvement: In many cultures, family play a central and expected decision-making role',
              'Death and dying: Beliefs about the dying process, last rites, and the afterlife vary significantly',
              'Touch and eye contact: Cultural norms around physical contact and eye contact vary widely',
            ],
          },
          {
            type: 'CONTENT', theme: 'white',
            title: 'Diverse Teams, Better Care',
            content: 'The UK care workforce is one of the most diverse in the world. Colleagues from different cultural backgrounds bring different perspectives, languages, and approaches to care — which is a significant asset.\n\nCultural competence means not just understanding resident diversity, but actively valuing and learning from colleague diversity too.',
          },
        ],
      },
      {
        title: 'Unconscious Bias',
        slides: [
          {
            type: 'CONTENT', theme: 'white',
            title: 'Biases We Do Not Know We Have',
            content: 'Unconscious bias refers to attitudes and stereotypes that influence our decisions and actions without our awareness. We all carry them — they develop through upbringing, culture, media, and experience.\n\nIn care, unconscious bias can lead to unequal treatment: assuming a resident does not need pain relief based on their background, or dismissing a family member\'s concern because of how they express it.',
          },
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Recognising and Reducing Bias',
            bullets: [
              'Pause before assuming: Ask yourself "Why am I thinking this?" when you notice an assumption',
              'Treat individuals as individuals — avoid applying group characteristics to specific people',
              'Ask rather than assume: Respectfully asking about preferences shows respect and prevents errors',
              'Challenge bias in your team: If you hear a colleague making an assumption, question it professionally',
              'Commit to learning: Training and exposure to diverse perspectives reduces bias over time',
            ],
          },
        ],
      },
      {
        title: 'Culturally Responsive Care in Practice',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'white',
            title: 'Practical Approaches',
            bullets: [
              'Ask residents and families about their cultural and religious preferences on admission',
              'Record cultural needs clearly in the care plan and share with the whole team',
              'Use approved interpreters for language barriers — do not rely on family members for medical conversations',
              'Respect dietary requirements without asking residents to justify them',
              'Accommodate religious practices: prayer times, religious dress, rituals around illness and death',
              'Never assume a cultural preference — always ask respectfully first',
            ],
          },
          {
            type: 'QUOTE', theme: 'dark',
            title: 'A principle of culturally competent care',
            content: 'People do not care how much you know until they know how much you care — and care means seeing them as who they are, not who you assume them to be.',
          },
        ],
      },
      {
        title: 'Your Commitment to Inclusive Care',
        slides: [
          {
            type: 'BULLET_LIST', theme: 'emerald',
            title: 'A Personal Commitment',
            bullets: [
              'I will ask rather than assume about the cultural needs of the residents I care for',
              'I will challenge my own assumptions before acting on them',
              'I will use an approved interpreter when language creates a risk to communication',
              'I will respect religious and cultural practices even when they are unfamiliar to me',
              'I will speak up if I witness care that fails to respect a resident\'s cultural identity',
              'I will continue to learn about the diverse communities I serve',
            ],
          },
          {
            type: 'TITLE', theme: 'blue',
            title: 'Key Takeaway',
            content: 'Cultural competence is not a destination — it is a commitment to continuous learning and respect. Every resident deserves care that honours who they are.',
          },
        ],
      },
    ],
    quiz: [
      {
        question: 'Cultural competence in care means:',
        options: [
          'Treating all residents identically regardless of their background',
          'Knowing everything about every culture represented in the UK',
          'Understanding and respectfully responding to residents\' cultural backgrounds and individual needs',
          'Only adapting your care approach when a resident explicitly requests it',
        ],
        correctAnswer: 2,
        explanation: 'Cultural competence means being aware that culture shapes how people experience care, and proactively asking about and respecting those individual needs — not waiting to be asked.',
      },
      {
        question: 'Unconscious bias in care refers to:',
        options: [
          'Deliberately treating residents from different backgrounds differently',
          'Attitudes and stereotypes we are unaware of that can influence how we provide care',
          'Being naturally curious about the cultural backgrounds of your colleagues',
          'Double-checking your own assumptions before making a care decision',
        ],
        correctAnswer: 1,
        explanation: 'Unconscious biases are attitudes and stereotypes that operate below our conscious awareness — they can lead to unequal treatment if not recognised and actively addressed.',
      },
      {
        question: 'When a resident\'s first language is not English and a medical conversation is needed, you should:',
        options: [
          'Ask the resident\'s family member to translate',
          'Use simple words and gestures and hope they understand',
          'Use an approved interpreter to ensure accuracy and protect the resident',
          'Document that effective communication was not possible',
        ],
        correctAnswer: 2,
        explanation: 'Approved interpreters must be used for medical conversations — family members may not have the necessary knowledge, and confidentiality and accuracy must be maintained.',
      },
    ],
  },
];

// ─── Seed runner ──────────────────────────────────────────────────────────────

async function main() {
  // 1. Find the course
  const course = await prisma.course.findFirst({
    where: { title: { contains: 'Soft Skills' } },
  });
  if (!course) {
    console.error('ERROR: Soft Skills course not found. Make sure it exists in the database.');
    process.exit(1);
  }
  console.log(`Found course: "${course.title}" (${course.id})`);

  // 2. Clear existing flat lessons for this course (progress and slides cascade)
  const existingLessons = await prisma.lesson.findMany({ where: { courseId: course.id } });
  if (existingLessons.length > 0) {
    console.log(`Deleting ${existingLessons.length} existing lessons...`);
    await prisma.lesson.deleteMany({ where: { courseId: course.id } });
  }

  // 3. Clear existing chapters (quiz + quiz attempts cascade via ChapterQuiz relation)
  const existingChapters = await prisma.chapter.findMany({ where: { courseId: course.id } });
  if (existingChapters.length > 0) {
    console.log(`Deleting ${existingChapters.length} existing chapters...`);
    await prisma.chapter.deleteMany({ where: { courseId: course.id } });
  }

  console.log('Creating chapters, lessons, slides and quizzes...\n');

  // 4. Create chapters
  for (let ci = 0; ci < CHAPTERS.length; ci++) {
    const chapterData = CHAPTERS[ci];

    const chapter = await prisma.chapter.create({
      data: {
        courseId: course.id,
        title: chapterData.title,
        description: chapterData.description,
        order: ci + 1,
      },
    });

    // Create lessons within this chapter
    for (let li = 0; li < chapterData.lessons.length; li++) {
      const lessonData = chapterData.lessons[li];

      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          chapterId: chapter.id,
          title: lessonData.title,
          content: '',
          order: li + 1,
        },
      });

      // Create slides within this lesson
      for (let si = 0; si < lessonData.slides.length; si++) {
        const s = lessonData.slides[si];
        await prisma.slide.create({
          data: {
            lessonId: lesson.id,
            slideType: s.type,
            backgroundTheme: s.theme,
            title: s.title || '',
            content: s.content || '',
            bulletPoints: s.bullets || [],
            order: si + 1,
          },
        });
      }
    }

    // Create chapter quiz
    const quiz = await prisma.chapterQuiz.create({ data: { chapterId: chapter.id } });
    for (let qi = 0; qi < chapterData.quiz.length; qi++) {
      const q = chapterData.quiz[qi];
      await prisma.chapterQuestion.create({
        data: {
          quizId: quiz.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: qi + 1,
        },
      });
    }

    const slideCount = chapterData.lessons.reduce((s, l) => s + l.slides.length, 0);
    console.log(
      `  Chapter ${ci + 1}: "${chapterData.title}" — ${chapterData.lessons.length} lessons, ${slideCount} slides, ${chapterData.quiz.length} quiz questions`
    );
  }

  const totalLessons = CHAPTERS.reduce((s, c) => s + c.lessons.length, 0);
  const totalSlides = CHAPTERS.reduce((s, c) => s + c.lessons.reduce((ls, l) => ls + l.slides.length, 0), 0);
  console.log(`\nDone. Created ${CHAPTERS.length} chapters, ${totalLessons} lessons, ${totalSlides} slides.`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
