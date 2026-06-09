require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Lead Nurse database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const employeePassword = await bcrypt.hash('Employee@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@lms.com', password: adminPassword, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'employee@lms.com' },
    update: {},
    create: { name: 'Jane Smith', email: 'employee@lms.com', password: employeePassword, role: 'EMPLOYEE' },
  });

  // Clear all existing courses (cascades to lessons, assessments, progress, enrollments, certificates)
  await prisma.course.deleteMany({});
  console.log('Cleared existing courses...');

  const course = await prisma.course.create({
    data: {
      title: 'Soft Skills – The Valuable Human Edge in Healthcare Application',
      description:
        'Essential soft skills training for temporary care staff placed by Lead Nurse Ltd. Covers 7 key skills: Emotional Intelligence, Effective Communication, Critical Thinking, Resilience, Transformational Leadership, Adaptability, and Cultural Competence. Research from NHS and Health Education England shows ~90% of patient and family satisfaction comes from how staff communicate, show empathy, and handle emotions.',
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Emotional Intelligence (EI)',
            order: 1,
            content: `# Emotional Intelligence (EI)

## Definition

The ability to recognise, understand and manage your own emotions and those of others — encompassing self-awareness, self-regulation, motivation, empathy, and social skills.

## Why It Matters in Care Homes

You walk into a new shift with stressed colleagues, anxious families, and residents who may be confused or in pain. High EI stops you reacting with frustration and helps you respond calmly.

Research from NHS and Health Education England shows that approximately **90% of patient and family satisfaction** comes from how staff communicate, show empathy, and handle emotions — not just from technical tasks.

## The 5 Components of Emotional Intelligence

1. **Self-Awareness** — Recognising your own emotions as they happen and understanding how they affect your behaviour
2. **Self-Regulation** — Managing your emotions constructively in challenging or stressful situations
3. **Motivation** — Staying driven, positive, and focused even when shifts are difficult
4. **Empathy** — Genuinely understanding and acknowledging the feelings of residents, families, and colleagues
5. **Social Skills** — Building rapport, managing relationships, and communicating effectively with everyone on your team

## Practical Tips for Your Next Shift

- **Pause and name your emotion** — In a difficult moment, silently say: *"I'm feeling overwhelmed right now."* Research shows that naming an emotion reduces its intensity.
- **Use the 10-second rule** — Before answering a difficult family member, pause for 10 seconds. This deliberate pause helps you choose a thoughtful response over a reactive one.
- **Show empathy with words** — Try: *"It must be really hard seeing your mum like this today."*

## What EI Looks Like in Practice

A resident is repeatedly asking where their family member is and staff are feeling overwhelmed. Rather than reacting with frustration, pause and name your emotion. Use the 10-second rule before replying, then respond with empathy:

> *"I understand you're worried about your family — that's completely understandable. Let me find out for you right now."*

## Self-Assessment Checklist

After each shift, ask yourself:

- Did I introduce myself clearly to every resident I cared for?
- Did I listen more than I spoke?
- Did I stay calm when challenged?
- Did I name my emotions to myself when they arose?

## Key Takeaway

High EI does not mean suppressing your emotions — it means understanding them well enough to choose how you respond. Residents and families feel the difference.`,
          },
          {
            title: 'Effective Communication',
            order: 2,
            content: `# Effective Communication

## Definition

Clear, kind, two-way exchange of information — encompassing verbal, non-verbal, active listening, and written communication.

## Why It Matters

Poor communication is at the root of most complaints in care settings. As a temporary staff member, communicating clearly and kindly from your very first moment on shift builds trust quickly — with residents, families, and the permanent team.

## The Four Modes of Communication

**Verbal** — The words you use; tone, pace, and clarity matter equally to the content.

**Non-Verbal** — Posture, eye contact, facial expressions, and gestures often communicate more than words.

**Active Listening** — Fully concentrating, understanding, and responding. Not simply waiting for your turn to speak.

**Written** — Documentation, handover notes, and care plans. Accurate and timely written records are a patient safety issue.

## The SBAR Framework for Handovers

Use **SBAR** to structure clear, concise communication when handing over to the next shift:

- **S — Situation**: What is happening right now? *"Mrs. Jones is reporting chest pain."*
- **B — Background**: Relevant history. *"She has a history of angina and was reviewed by the GP two days ago."*
- **A — Assessment**: Your professional assessment. *"Her pain is currently a 6/10 and she appears anxious."*
- **R — Recommendation**: What needs to happen next. *"I recommend a nurse review before the next medication round."*

## Active Listening in Practice

- Put your pen down and face the person fully
- Maintain gentle, appropriate eye contact
- Nod to show you are engaged and following along
- Paraphrase to confirm understanding: *"So what I'm hearing is that you're worried about the change in her routine — is that right?"*
- Avoid interrupting or finishing the resident's sentences

## Tips for Temporary Staff

**Always introduce yourself clearly at the start of every shift:**

> *"Hi, I'm [Name] from Lead Nurse Ltd. I'm looking after you today. How are you feeling?"*

**When communicating with residents who have dementia:**
- Use simple, plain language and avoid medical jargon
- Speak slowly, calmly, and at a gentle pace
- Use short sentences — one idea at a time
- Supplement verbal communication with visual cues or gestures

## Key Takeaway

Effective communication is never one-directional. The most powerful communication skill is listening — genuinely, actively, and without judgment.`,
          },
          {
            title: 'Critical Thinking',
            order: 3,
            content: `# Critical Thinking

## Definition

Analysing information quickly and making safe, informed decisions — even when protocols differ between care homes or situations are ambiguous.

## Why It Matters

As a temporary staff member, you will often encounter situations where the protocol at one home differs from another, where a resident's behaviour is unexpected, or where quick decisions must be made without full information. Critical thinking bridges knowledge and safe action.

## The "What? So What? Now What?" Framework

Use this three-step mental model on every shift to process information and act decisively:

1. **What?** — What is actually happening? What are the facts? *(Observation)*
2. **So what?** — What does this mean? What is the risk or concern? *(Analysis)*
3. **Now what?** — What should I do about it? *(Decision and Action)*

### Example in Practice

A resident has been quieter since morning and is refusing lunch.

- **What?** The resident is less responsive and not eating.
- **So what?** This could indicate pain, infection, low mood, or a change in condition.
- **Now what?** Check for pain or discomfort, ask open questions, consult the nurse in charge, and document your observations.

## Scenario: A Resident Refuses Medication

When a resident refuses medication but cannot clearly explain why, apply critical thinking:

1. **Check** for pain, discomfort, or potential side-effects causing the refusal
2. **Ask** open, non-leading questions: *"Can you help me understand why you don't want to take it today?"*
3. **Consult** the nurse in charge or a more senior colleague
4. **Document** everything — the refusal, your observations, questions asked, and any actions taken

Do not force medication. Do not document a refusal without investigation. Always explore the reason.

## When Protocols Differ Between Homes

When you encounter a discrepancy between what you know and what is practised at a specific home:

- Do not default to what you know from another home without checking
- Assess the situation in context, prioritising what is safest for the resident
- If unsure, escalate — consulting the nurse in charge is professional judgment, not weakness
- Document your reasoning and the outcome

## Key Takeaway

Critical thinking is not about having all the answers — it is about asking the right questions, making safe decisions, and knowing when to seek support.`,
          },
          {
            title: 'Resilience',
            order: 4,
            content: `# Resilience

## Definition

The ability to bounce back from difficult shifts, criticism, or emotionally demanding situations without burning out.

## Why It Matters

Care work is emotionally demanding. You will encounter loss, distress, and high-pressure situations regularly. Resilience is not about being unaffected — it is about having strategies to process experiences, recover, and continue providing safe, compassionate care.

> **Resilient staff stay longer and provide safer care.**

## Why Resilience Matters Beyond You

When you build personal resilience:

- Residents receive more consistent, safer care
- Colleagues are supported by a calmer, steadier teammate
- You are more likely to remain in the profession long-term
- Your own wellbeing improves — and that is always worth protecting

## Three Practical Resilience Strategies

### 1. The Bookend Strategy

Create a mental and physical boundary between your personal life and your shift.

- **Before your shift:** Take 2 minutes for a breathing exercise. Breathe in for 4 counts, hold for 4, breathe out for 6. This activates your calm state and prepares you mentally.
- **After your shift:** Repeat the same 2-minute exercise. This signals to your body and mind that the shift is over and you are transitioning back to your own space.

### 2. Reframing

When a difficult interaction affects you, consciously reframe it:

- Instead of: *"That resident was rude to me."*
- Try: *"That resident is frightened and in pain. Their reaction was not about me."*

This does not dismiss the difficulty — it removes unnecessary self-blame and protects your sense of worth.

### 3. Debrief

Do not carry the weight of a difficult shift alone.

- Debrief with a trusted colleague after a tough shift
- Call the **Lead Nurse Ltd support line** if you need to talk through a difficult experience
- Even a brief conversation can significantly reduce the emotional load of a hard day

## Quick Reflection

After your next shift, ask yourself:
1. What was the most challenging moment of the shift?
2. What emotion did it trigger in me?
3. Which of the three strategies above could I apply next time?

## Key Takeaway

Resilience is a skill, not a personality trait. It can be practised, strengthened, and developed — one shift at a time.`,
          },
          {
            title: 'Transformational Leadership',
            order: 5,
            content: `# Transformational Leadership

## Definition

Inspiring and positively influencing others — regardless of your job title or seniority.

## A Common Misconception

Many people believe leadership only belongs to those with formal authority — managers, senior nurses, team leaders. This is not true.

Every person on a care team has the capacity to lead through their actions, attitude, and the example they set. As a temporary staff member, your fresh perspective and consistent professionalism can have a powerful positive influence on an entire team.

## How Temporary Staff Can Demonstrate Transformational Leadership

### 1. Lead by Example

Be the one who sets the standard — not because you have to, but because you choose to.

- Be the first to help with mealtimes when residents need support
- Take initiative to tidy the lounge or restock supplies without being asked
- Arrive on time and prepared, with a calm and professional attitude

People notice. And what they notice, they often follow.

### 2. Encourage and Acknowledge Peers

Recognition is a powerful motivator, especially in high-pressure environments.

A simple, sincere statement can shift someone's entire shift:

> *"You handled that really well — thank you."*
> *"I noticed how calm you were with Mrs. Johnson earlier. That was brilliant."*

These small moments of acknowledgment have a ripple effect on team morale.

### 3. Suggest Small, Collaborative Improvements

You are not expected to overhaul care plans or redesign systems. But small, thoughtful suggestions show professional engagement.

- *"I noticed the call bells seemed slow today — shall we check the batteries together?"*
- *"Would it help if we updated the handover sheet to include this? It might save time."*

Frame suggestions collaboratively — *"shall we..."* and *"would it help if..."* invite participation rather than criticising existing practice.

## The Ripple Effect

One person's calm, professional, encouraging presence creates a positive ripple. Teams become more cohesive, residents feel the difference in atmosphere, and your reputation as someone worth re-booking grows naturally.

## Key Takeaway

You do not need a title to lead. You need intention, consistency, and the willingness to lift others as you go.`,
          },
          {
            title: 'Adaptability',
            order: 6,
            content: `# Adaptability

## Definition

Adjusting quickly and effectively to new environments, different care plans, varied IT systems, and diverse team cultures.

## Why It Matters for Agency Staff

Every care home is different. The layout, the residents, the routines, the documentation systems, the team dynamics — all vary. The ability to walk into a new environment and function effectively from the first hour is one of the most valuable qualities a temporary staff member can demonstrate.

Adaptability is not about abandoning your professional standards. It is about applying those standards flexibly and intelligently in each unique setting.

## Four Areas to Adapt Quickly

### 1. New Environments
- Orientate yourself quickly: where are the emergency exits, medication room, and staff room?
- Identify key people: who is the nurse in charge today? Who do you escalate to?

### 2. Different Care Plans
- Read each resident's care plan carefully — do not assume it matches what you've seen elsewhere
- Note specific preferences, mobility needs, dietary requirements, and communication styles
- Flag discrepancies or concerns to the nurse in charge promptly

### 3. IT Systems
- Homes use different electronic care systems (e.g., Person Centred Software, Nourish, CareDocs)
- Ask for a brief orientation — most staff are happy to help
- If unsure, record observations on paper first and transfer to the system with support

### 4. Team Cultures
- Observe how the team communicates before imposing your usual style
- Follow the preferred handover method of the home
- Use inclusive language and avoid comparing homes in ways that may feel critical to permanent staff

## Practical Tip: The First 15 Minutes

> **Arrive 15 minutes early.** Read the care plans. Ask one key question:
> *"What's different here compared to other homes I work in?"*

This single habit will make you stand out as professional, prepared, and genuinely committed to that home's residents.

## The Mindset of an Adaptable Professional

- **Curious:** Ask questions; every home has something to teach you
- **Humble:** Your way is not the only way — and that is fine
- **Proactive:** Do not wait to be told; observe, read, and adapt

## Key Takeaway

Adaptability is not a compromise of standards — it is the intelligent application of your skills in every new environment you enter.`,
          },
          {
            title: 'Cultural Competence',
            order: 7,
            content: `# Cultural Competence

## Definition

Respecting and thoughtfully responding to the diverse beliefs, languages, dietary requirements, and customs of residents and their families.

## Why It Matters

The UK's care sector serves one of the most diverse populations in the world. Every resident is a whole person — shaped by their culture, faith, language, and life experiences. Culturally competent care is not an optional add-on; it is a core component of person-centred, dignified care.

## The Simple Rule

> **"Curious, not judgemental."**

Rather than assuming you know what a resident needs based on their background, ask open, respectful questions. The most powerful question you can ask is:

> *"Is there anything important to you or your family that I should know to care for you well?"*

## Key Areas of Cultural Competence

### Religious Practices and Observances

- Ask about prayer times, religious festivals, or fasting periods (e.g., Ramadan) that may affect daily routines
- Accommodate these respectfully — adjust mealtimes, activity schedules, or personal care routines where possible
- Never dismiss or minimise a resident's faith practices

### Dietary Requirements

Many residents have dietary needs rooted in religious, cultural, or ethical beliefs:

- Offer halal, kosher, or vegan options proactively — do not wait to be asked
- Check ingredients and food preparation methods carefully
- Clearly label meals and work with the kitchen team to ensure options are genuinely available
- Treat dietary preferences with the same seriousness as clinical dietary restrictions

### Language Differences

- Use simple, jargon-free language when communicating with residents or families for whom English is not a first language
- Supplement verbal communication with visuals, pictures, or written summaries
- Seek access to interpreter services or bilingual staff where available
- Confirm understanding by asking the resident or family member to paraphrase key points in their own words

### Family Involvement in Care

- In many cultures, families expect to be actively involved in personal care and decision-making
- Recognise and support appropriate family involvement
- Clarify roles and boundaries respectfully and document agreed levels of involvement in the care plan

## Common Barriers and How to Address Them

**Language differences** — Use plain language, visuals, and interpreter services.

**Different family involvement expectations** — Have a clear, respectful conversation; document the agreed approach.

**Unfamiliar dietary or religious practices** — Ask open questions, research, and offer appropriate alternatives.

## Practical Scenarios

**A resident observes Ramadan:** Be mindful of fasting hours. Offer meals after sunset. Adjust activity schedules. Respect prayer times. Never pressure a fasting resident to eat or drink during fasting hours.

**A family speaks limited English:** Use simple language. Offer written summaries with visual support. Arrange an interpreter if available. Never assume understanding without confirming it.

**A resident requests halal meals but kitchen is unsure:** Confirm the requirements, communicate with kitchen management, offer halal-certified options, and label meals clearly.

## Key Takeaway

Cultural competence is not about knowing everything about every culture — it is about being curious, respectful, and willing to ask and learn. Person-centred care begins with seeing each resident as an individual, not a category.`,
          },
        ],
      },
    },
  });

  await prisma.assessment.create({
    data: {
      courseId: course.id,
      passScore: 70,
      maxAttempts: 3,
      questions: {
        create: [
          // Emotional Intelligence
          {
            question: 'Which of the following best defines Emotional Intelligence (EI)?',
            options: [
              "The ability to memorise every resident's care plan",
              'The ability to recognise, understand and manage your own emotions and those of others',
              'The skill of avoiding conversations about feelings',
              'The capacity to work long hours without stress',
            ],
            correctAnswer: 1,
            order: 1,
          },
          {
            question: 'What is the purpose of the "10-second rule" when responding to a difficult family member?',
            options: [
              'To ensure you take a break before answering',
              'To delay any response for 10 minutes',
              'To pause and collect your thoughts before replying',
              'To call a supervisor after 10 seconds',
            ],
            correctAnswer: 2,
            order: 2,
          },
          {
            question: "Which statement best demonstrates empathy with a resident's family?",
            options: [
              "\"I'm sure you're overreacting.\"",
              '"It must be really hard seeing your mum like this today."',
              '"Calm down; we\'ll fix it."',
              "\"That's not my problem.\"",
            ],
            correctAnswer: 1,
            order: 3,
          },
          {
            question: 'True or False: Empathy means sharing your own personal feelings with residents.',
            options: ['True', 'False'],
            correctAnswer: 1,
            order: 4,
          },
          // Effective Communication
          {
            question: 'What is the core idea of Effective Communication in care settings?',
            options: [
              'One-way transmission of information from staff to residents',
              'Clear, kind, two-way exchange of information',
              'Using medical jargon to demonstrate clinical expertise',
              'Recording notes without direct interaction',
            ],
            correctAnswer: 1,
            order: 5,
          },
          {
            question: 'Which framework best supports structured handovers between shifts?',
            options: [
              'SBAR (Situation–Background–Assessment–Recommendation)',
              'FIRO-B Assessment',
              'SOAP notes only',
              'Silent reading of charts',
            ],
            correctAnswer: 0,
            order: 6,
          },
          {
            question: 'In active listening, which action is most consistent with the training?',
            options: [
              'Multitask while the resident speaks to save time',
              'Put your pen down, face the person, nod, and repeat back what they said',
              "Interrupt to finish the resident's sentences",
              'Keep your focus on your to-do list',
            ],
            correctAnswer: 1,
            order: 7,
          },
          {
            question:
              'True or False: Non-verbal cues such as posture and eye contact are part of effective communication.',
            options: ['True', 'False'],
            correctAnswer: 0,
            order: 8,
          },
          // Critical Thinking
          {
            question: 'What best defines Critical Thinking in a care-home context?',
            options: [
              'Following a fixed protocol without deviation',
              'Analysing information quickly and making safe decisions, even when protocols differ between homes',
              'Asking residents to make all decisions for themselves',
              'Avoiding new information that contradicts current practices',
            ],
            correctAnswer: 1,
            order: 9,
          },
          {
            question:
              'A resident refuses medication but cannot clearly explain why. Which initial step aligns with the training?',
            options: [
              'Administer the medication regardless to ensure compliance',
              'Document the refusal without further action',
              'Check for pain or potential side-effects',
              'Escalate to the family member immediately without any assessment',
            ],
            correctAnswer: 2,
            order: 10,
          },
          {
            question: 'The "What? So what? Now what?" framework is used to:',
            options: [
              'Schedule tasks for the next day',
              'Question and reflect on information to guide safe, decisive action',
              'Prioritise administrative duties over clinical tasks',
              'Teach residents how to manage their own medications',
            ],
            correctAnswer: 1,
            order: 11,
          },
          {
            question:
              'True or False: Consulting a supervisor or nurse in charge is a sign of poor independent thinking.',
            options: ['True', 'False'],
            correctAnswer: 1,
            order: 12,
          },
          // Resilience
          {
            question: 'What best defines resilience in the healthcare workplace?',
            options: [
              'Never experiencing stress or emotionally challenging situations',
              'Bouncing back from difficult shifts, criticism, or emotional situations without burning out',
              'Always solving problems independently without any help',
              'Avoiding emotionally demanding interactions with residents',
            ],
            correctAnswer: 1,
            order: 13,
          },
          {
            question: 'Which of the following is the "Bookend" resilience strategy described in the training?',
            options: [
              'A 5-minute stretching session at lunch',
              'A 2-minute breathing exercise before you start and after you finish your shift',
              'Writing a daily reflection journal at the end of each week',
              'Calling a colleague during a shift for emotional support',
            ],
            correctAnswer: 1,
            order: 14,
          },
          {
            question:
              'True or False: Resilience means ignoring your feelings and pushing through tough shifts without acknowledging them.',
            options: ['True', 'False'],
            correctAnswer: 1,
            order: 15,
          },
          // Transformational Leadership
          {
            question: 'What best defines transformational leadership as described in the training?',
            options: [
              'Exercising formal authority to direct others',
              'Inspiring and influencing others positively, even without a formal title',
              'Focusing solely on completing your own assigned tasks',
              'Maintaining existing routines to avoid any disruption',
            ],
            correctAnswer: 1,
            order: 16,
          },
          {
            question: 'Which action best demonstrates "lead by example" as a temporary care staff member?',
            options: [
              'Waiting for a permanent staff member to initiate mealtimes',
              'Being the first to help with mealtimes or tidy the lounge without being asked',
              'Only performing tasks when directly instructed by a supervisor',
              'Keeping to yourself to avoid overstepping boundaries',
            ],
            correctAnswer: 1,
            order: 17,
          },
          {
            question:
              'True or False: You must hold a formal leadership position to demonstrate transformational leadership.',
            options: ['True', 'False'],
            correctAnswer: 1,
            order: 18,
          },
          // Adaptability
          {
            question: 'What is the recommended practical tip for agency staff arriving at a new care location?',
            options: [
              'Wait for the shift supervisor to brief you before doing anything',
              'Follow the exact same routine as your previous placement',
              "Arrive 15 minutes early, read the care plans, and ask \"What's different here compared to other homes?\"",
              'Focus only on your assigned clinical tasks during the first hour',
            ],
            correctAnswer: 2,
            order: 19,
          },
          // Cultural Competence
          {
            question:
              'What simple guiding rule does the training recommend for culturally competent interactions?',
            options: [
              '"Inform, then proceed"',
              '"Follow the standard protocol at all times"',
              '"Curious, not judgemental"',
              '"Document first, ask later"',
            ],
            correctAnswer: 2,
            order: 20,
          },
        ],
      },
    },
  });

  console.log('Seeding complete!');
  // Seed healthcare roles
  const roles = [
    { name: 'Registered Nurse (RN)', description: 'Qualified nurse registered with the NMC' },
    { name: 'Healthcare Assistant (HCA)', description: 'Support worker assisting nursing staff' },
    { name: 'Senior Carer', description: 'Experienced carer with supervisory responsibilities' },
    { name: 'Support Worker', description: 'General support worker in a care setting' },
    { name: 'Mental Health Nurse', description: 'Specialist nurse in mental health settings' },
    { name: 'Community Nurse', description: 'Nurse providing care in community settings' },
    { name: 'Ward Manager', description: 'Senior nurse managing ward operations' },
    { name: 'Phlebotomist', description: 'Specialist in drawing blood samples' },
    { name: 'Dementia Care Specialist', description: 'Specialist in care for patients with dementia' },
    { name: 'Palliative Care Nurse', description: 'Specialist in end-of-life care' },
  ];

  for (const r of roles) {
    await prisma.healthcareRole.upsert({ where: { name: r.name }, update: {}, create: r });
  }
  console.log(`Seeded ${roles.length} healthcare roles`);

  // Seed a sample facility
  await prisma.facility.upsert({
    where: { id: 'facility-demo-001' },
    update: {},
    create: {
      id: 'facility-demo-001',
      name: 'Sunrise Care Home',
      type: 'CARE_HOME',
      address: '45 Elm Street',
      city: 'London',
      postcode: 'E1 6RF',
      contactName: 'Mary Johnson',
      contactEmail: 'mary@sunrisecare.co.uk',
      contactPhone: '020 7946 0123',
    },
  });
  console.log('Seeded sample facility');

  console.log('Admin:    admin@lms.com    / Admin@123');
  console.log('Employee: employee@lms.com / Employee@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
