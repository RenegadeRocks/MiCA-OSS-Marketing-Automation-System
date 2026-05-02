export const DEMO_MODE_ENABLED = () => {
    return localStorage.getItem('mica_demo_mode') === 'true';
};

export const DEMO_CAMPAIGN = {
    // Campaign Details
    id: "demo-happiness-001",
    user_id: "demo-user",
    product_name: "Happiness Program by Art of Living",
    product_description: " A 4-day transformative wellness workshop led by Rajni Chowdhary, teaching SKY Breath Meditation (Sudarshan Kriya), yoga, and practical life tools for stress relief, better sleep, and emotional resilience. Participants learn powerful breathing techniques backed by 100+ peer-reviewed studies. Suitable for all ages, no prior experience needed. Available in-person and online.\nRegistration link: www.registrationlink.com",
    target_audience: "working professionals aged 25-45",
    launch_date: "2026-05-06",
    budget: 5000,
    location: "New Delhi",
    tone: "Warm & Inspirational",
    tone_custom_words: "",
    status: "plan_ready",
    recommended_channels: [
    "email",
    "whatsapp",
    "instagram"
],
    recipient_count: 1250,
    launched_at: "2026-03-24T09:00:00Z",
    campaign_start_date: "2026-03-24",
    campaign_end_date: "2026-04-20",

    // Tone Preview
    tone_preview_content: {
    "sample_email": {
        "subject": "What if 4 days could change how you breathe & live?",
        "opening_paragraph": "You give your best to your work, your family, and your goals every single day — but when was the last time you did something truly transformative for yourself?"
    },
    "tone_summary": "The tone is warm, uplifting, and deeply human — speaking directly to the everyday stress that working professionals in Delhi carry, while gently inviting them toward a transformative experience. We'll use an inspirational yet grounded voice that feels like a caring mentor, not a salesperson, weaving in the credibility of 100+ research studies alongside the emotional promise of inner peace and resilience.",
    "sample_whatsapp": {
        "message": "Hey! 😊 Just wanted to share something that could genuinely make a difference — the Happiness Program by Art of Living is happening in New Delhi from 6th May. It's a 4-day workshop where you learn SKY Breath Meditation for stress relief, better sleep & emotional strength. Led by Rajni Chowdhary, no experience needed. Thousands of professionals swear by it. Seats are limited — check it out & register here: www.registrationlink.com"
    },
    "channel_reasoning": "Email and WhatsApp are essential for direct, personal outreach to working professionals who check both daily. With a ₹5,000 budget, Instagram is included to leverage visual storytelling and carousel posts that resonate with the 25-45 demographic in metro cities like Delhi, maximizing organic and low-cost paid reach.",
    "sample_social_post": {
        "caption": "You hustle through Monday meetings. You survive Delhi traffic. You show up for everyone.\n\nBut here's a question that deserves your attention today:\nWho shows up for YOU? 🤍\n\nThe Happiness Program by Art of Living is a 4-day transformative workshop coming to New Delhi — and it might just be the reset you didn't know you needed.\n\n✨ Learn SKY Breath Meditation (Sudarshan Kriya)\n✨ Experience yoga & practical tools for emotional resilience\n✨ Backed by 100+ peer-reviewed research studies\n✨ Led by Rajni Chowdhary\n✨ No prior experience needed\n\nStarting 6th May 2026. Available in-person & online.\n\nYour calm, clear, happier self is just 4 days away.\n👉 Register now: www.registrationlink.com\n\n#HappinessProgram #ArtOfLiving #SudarshanKriya #StressRelief #DelhiWellness",
        "post_type": "carousel"
    },
    "recommended_channels": [
        "email",
        "whatsapp",
        "instagram"
    ]
},

    // Marketing Plan
    marketing_plan: {
    "methodology": {
        "name": "PAS",
        "reasoning": "Working professionals aged 25-45 in Delhi are acutely aware of their stress, poor sleep, and emotional fatigue — but they've normalised it. PAS (Problem → Agitation → Solution) is ideal because it first names the pain they're living with, then deepens the emotional urgency by showing what prolonged stress costs them (health, relationships, clarity), and finally positions the Happiness Program as the scientifically validated, accessible solution. This methodology mirrors the audience's internal journey from 'I'm fine, just busy' to 'I need to do something about this' — which is exactly the shift needed to drive registrations for a wellness workshop."
    },
    "weekly_plan": [
        {
            "goal": "Name the problem. Make the audience recognise their own stress and stop normalising it.",
            "week": 1,
            "theme": "The Stress You're Ignoring",
            "tactics": [
                {
                    "day": 1,
                    "action": "Send Email 1: Problem Awareness",
                    "channel": "email",
                    "description": "Subject line: 'How are you really doing?' A warm, personal email acknowledging that Delhi's work culture normalises exhaustion. End with a reflective question, no sell.",
                    "stage_reference": "Email — Problem Awareness"
                },
                {
                    "day": 1,
                    "action": "Send Message 1: Warm Opening",
                    "channel": "whatsapp",
                    "description": "A personal, conversational greeting asking how they're genuinely doing. No product mention — just human connection and rapport building.",
                    "stage_reference": "WhatsApp — Warm Introduction"
                },
                {
                    "day": 2,
                    "action": "Publish Post 1: '5 Signs Your Body Is Begging You to Slow Down'",
                    "channel": "instagram",
                    "description": "Static carousel with clean design listing stress symptoms professionals relate to. Boost with ₹400 targeting Delhi professionals 25-45.",
                    "stage_reference": "Instagram — Problem Awareness & Hook"
                },
                {
                    "day": 4,
                    "action": "Send Message 2: Free Breathing Tip",
                    "channel": "whatsapp",
                    "description": "Share a simple 4-count exhale technique they can try at their desk right now. Give value first — build trust before any ask.",
                    "stage_reference": "WhatsApp — Warm Introduction"
                },
                {
                    "day": 5,
                    "action": "Send Email 2: Sleep Deprivation's Hidden Costs",
                    "channel": "email",
                    "description": "Focus on what poor sleep does to focus, immunity, and mood. Relatable scenarios for someone working 10+ hour days in Delhi.",
                    "stage_reference": "Email — Problem Awareness"
                },
                {
                    "day": 6,
                    "action": "Publish Post 2: Storytelling — 'I Thought Exhaustion Was Just Part of Success'",
                    "channel": "instagram",
                    "description": "Single image with a first-person narrative text overlay. Emotional, relatable, no product mention yet. Organic post.",
                    "stage_reference": "Instagram — Problem Awareness & Hook"
                }
            ],
            "days_covered": "Days 1-7"
        },
        {
            "goal": "Deepen the problem, validate past failed attempts, and plant the seed that breath is the missing piece.",
            "week": 2,
            "theme": "What If There's a Better Way?",
            "tactics": [
                {
                    "day": 8,
                    "action": "Send Message 3: The Burnout Epidemic",
                    "channel": "whatsapp",
                    "description": "A short, relatable note about how most Delhi professionals are running on fumes. End with: 'What if there's something that actually works?'",
                    "stage_reference": "WhatsApp — Warm Introduction"
                },
                {
                    "day": 9,
                    "action": "Publish Post 3: Engagement Poll — 'When Did You Last Wake Up Rested?'",
                    "channel": "instagram",
                    "description": "Calming visual with an interactive question in the caption. Drives comments and saves. Organic post to boost algorithm reach.",
                    "stage_reference": "Instagram — Problem Awareness & Hook"
                },
                {
                    "day": 10,
                    "action": "Send Email 3: 'Why Apps and Gyms Don't Fix Stress'",
                    "channel": "email",
                    "description": "Validate their past attempts at wellness. Introduce the concept that breath directly regulates the nervous system — unlike exercise or screen-based meditation.",
                    "stage_reference": "Email — Problem Awareness"
                },
                {
                    "day": 12,
                    "action": "Publish Post 4: Infographic — 'What Chronic Stress Does to Your Brain, Heart & Sleep'",
                    "channel": "instagram",
                    "description": "Clean, shareable infographic with simple icons. Boost with ₹400 targeting Delhi wellness-interested professionals.",
                    "stage_reference": "Instagram — Problem Awareness & Hook"
                },
                {
                    "day": 13,
                    "action": "Send Message 4: Personal Recommendation",
                    "channel": "whatsapp",
                    "description": "'Something I want to share with you' — introduce the Happiness Program naturally as something personally meaningful, not a sales pitch. Include one line about the 4-day format.",
                    "stage_reference": "WhatsApp — Build Interest"
                }
            ],
            "days_covered": "Days 8-14"
        },
        {
            "goal": "Introduce Sudarshan Kriya and the Happiness Program with scientific credibility. Shift from problem to solution.",
            "week": 3,
            "theme": "The Science of Breathing",
            "tactics": [
                {
                    "day": 15,
                    "action": "Send Email 4: 'What 5 Years of Chronic Stress Does to Your Body'",
                    "channel": "email",
                    "description": "Agitate the long-term cost of inaction — compounding health, relationship, and career consequences. Transition to: 'But there's a way to reverse this.'",
                    "stage_reference": "Email — Agitation & Education"
                },
                {
                    "day": 16,
                    "action": "Publish Post 5: 'A Breathing Technique Studied by Yale & Harvard'",
                    "channel": "instagram",
                    "description": "Static infographic highlighting Sudarshan Kriya's key research stats — 87.5% cortisol reduction, 71% anxiety relief. Boost with ₹800 for maximum reach.",
                    "stage_reference": "Instagram — Solution Introduction"
                },
                {
                    "day": 17,
                    "action": "Send Message 5: Share One Powerful Stat",
                    "channel": "whatsapp",
                    "description": "Share the 87.5% cortisol reduction stat with a personal note: 'I couldn't believe this either until I saw the peer-reviewed studies.' Link to registration page.",
                    "stage_reference": "WhatsApp — Build Interest"
                },
                {
                    "day": 19,
                    "action": "Send Email 5: 'The Technique Studied by Yale and Harvard'",
                    "channel": "email",
                    "description": "Deep dive into Sudarshan Kriya — what it is, how it works (rhythmic breathing that harmonises body and mind), and the research backing it. Position it as the core of the Happiness Program.",
                    "stage_reference": "Email — Agitation & Education"
                },
                {
                    "day": 20,
                    "action": "Publish Post 6: Social Proof — '500 Million People. 182 Countries.'",
                    "channel": "instagram",
                    "description": "Bold, clean quote card showing the scale of Art of Living's reach. Mention UN and WHO adoption. Organic post to build authority.",
                    "stage_reference": "Instagram — Solution Introduction"
                },
                {
                    "day": 21,
                    "action": "Send Message 6: Meet Rajni Chowdhary",
                    "channel": "whatsapp",
                    "description": "Brief, warm introduction to the instructor — who she is, her teaching approach, and why participants love her sessions. Humanise the experience.",
                    "stage_reference": "WhatsApp — Build Interest"
                }
            ],
            "days_covered": "Days 15-21"
        },
        {
            "goal": "Showcase the instructor, program details, and what participants receive. Make the program feel tangible and accessible.",
            "week": 4,
            "theme": "Your Guide, Your Program",
            "tactics": [
                {
                    "day": 22,
                    "action": "Publish Post 7: Program Details Card",
                    "channel": "instagram",
                    "description": "'The Happiness Program: 4 Days. Breath. Meditation. Yoga. Life Tools. Led by Rajni Chowdhary. May 6, Delhi.' Registration link in bio. Boost with ₹800.",
                    "stage_reference": "Instagram — Solution Introduction"
                },
                {
                    "day": 23,
                    "action": "Send Email 6: Meet Rajni Chowdhary",
                    "channel": "email",
                    "description": "A warm profile of the instructor — her journey, teaching philosophy, and what participants can expect from her guidance. Include a personal quote if available.",
                    "stage_reference": "Email — Agitation & Education"
                },
                {
                    "day": 24,
                    "action": "Send Message 7: What You Get After the Program",
                    "channel": "whatsapp",
                    "description": "Highlight the long-term value: lifetime free weekly practice groups in 182+ countries, a daily home practice, and a global community. Emphasise this isn't a one-time event.",
                    "stage_reference": "WhatsApp — Build Interest"
                },
                {
                    "day": 26,
                    "action": "Publish Post 8: Storytelling — Before/After Narrative",
                    "channel": "instagram",
                    "description": "Static image with text: 'Before: 3am anxiety spirals. After: sleeping through the night. All I changed was how I breathe.' Emotional, aspirational. Organic post.",
                    "stage_reference": "Instagram — Solution Introduction"
                },
                {
                    "day": 27,
                    "action": "Send Email 7: '500 Million People Already Know This'",
                    "channel": "email",
                    "description": "Social proof at scale — the global community, 182 countries, adoption by UN and WHO. Position joining the Happiness Program as joining a proven, worldwide movement.",
                    "stage_reference": "Email — Agitation & Education"
                },
                {
                    "day": 28,
                    "action": "Send Message 8: 'Imagine Waking Up Actually Rested'",
                    "channel": "whatsapp",
                    "description": "Paint a vivid picture of life after the program — calm mornings, better focus, lighter mood. Make the transformation feel real and attainable.",
                    "stage_reference": "WhatsApp — Desire & Social Proof"
                }
            ],
            "days_covered": "Days 22-28"
        },
        {
            "goal": "Deepen trust with research and social proof. Handle objections. Build strong desire to register.",
            "week": 5,
            "theme": "Trust, Proof, and Desire",
            "tactics": [
                {
                    "day": 29,
                    "action": "Publish Post 9: Research Highlight Card",
                    "channel": "instagram",
                    "description": "'70+ peer-reviewed studies. 4 continents. The science behind Sudarshan Kriya.' Clean, authoritative design. Boost with ₹600.",
                    "stage_reference": "Instagram — Trust & Desire Building"
                },
                {
                    "day": 30,
                    "action": "Send Email 8: 'Here's Exactly What Happens in 4 Days'",
                    "channel": "email",
                    "description": "Break down the program day by day — Kriya, pranayama, yoga, meditation, wisdom sessions. Highlight lifetime free practice groups and the daily home technique. Include registration link.",
                    "stage_reference": "Email — Solution & Conversion"
                },
                {
                    "day": 31,
                    "action": "Send Message 9: Global Scale",
                    "channel": "whatsapp",
                    "description": "'500 million people in 182 countries practise this. Delhi's next batch starts May 6 with Rajni Chowdhary.' Let the numbers speak.",
                    "stage_reference": "WhatsApp — Desire & Social Proof"
                },
                {
                    "day": 32,
                    "action": "Publish Post 10: Meet Rajni Chowdhary",
                    "channel": "instagram",
                    "description": "Warm image of the instructor with brief bio text overlay. 'Your guide to rediscovering calm. May 6, Delhi.' Organic post to humanise the experience.",
                    "stage_reference": "Instagram — Trust & Desire Building"
                },
                {
                    "day": 33,
                    "action": "Send Message 10: Handle Objections",
                    "channel": "whatsapp",
                    "description": "Casually address common hesitations: 'No yoga experience needed. No chanting. Just breathing. 3-4 hours a day for 4 days. That's it.'",
                    "stage_reference": "WhatsApp — Desire & Social Proof"
                },
                {
                    "day": 34,
                    "action": "Publish Post 11: Carousel — What You Get from the Program",
                    "channel": "instagram",
                    "description": "Slide-by-slide breakdown: Sudarshan Kriya, pranayama, yoga, guided meditation, life tools, lifetime free practice groups. Boost with ₹600.",
                    "stage_reference": "Instagram — Trust & Desire Building"
                },
                {
                    "day": 35,
                    "action": "Send Message 11: Warm Registration Nudge",
                    "channel": "whatsapp",
                    "description": "'I saved you a spot' energy — a friendly, personal nudge with the registration link. No pressure, just warmth.",
                    "stage_reference": "WhatsApp — Desire & Social Proof"
                }
            ],
            "days_covered": "Days 29-35"
        },
        {
            "goal": "Drive final registrations with urgency, clarity, and a warm but decisive call to action.",
            "week": 6,
            "theme": "Now or Never — Register for May 6",
            "tactics": [
                {
                    "day": 36,
                    "action": "Send Email 9: FAQ — Your Questions Answered",
                    "channel": "email",
                    "description": "Address all remaining objections: time commitment, no prior experience needed, medical accommodations, online option available. Remove every friction point to registration.",
                    "stage_reference": "Email — Solution & Conversion"
                },
                {
                    "day": 37,
                    "action": "Publish Post 12: Scale Visual — 182 Countries Map",
                    "channel": "instagram",
                    "description": "Map or number graphic showing global reach. 'Join the world's largest breathing community. Delhi batch: May 6.' Boost with ₹400.",
                    "stage_reference": "Instagram — Trust & Desire Building"
                },
                {
                    "day": 38,
                    "action": "Send Message 12: One Week to Go",
                    "channel": "whatsapp",
                    "description": "'One week to go — seats are filling for the May 6 Happiness Program with Rajni Chowdhary. Here's the registration link.'",
                    "stage_reference": "WhatsApp — Final Push"
                },
                {
                    "day": 39,
                    "action": "Publish Post 13: Countdown — '5 Days to Go'",
                    "channel": "instagram",
                    "description": "Bold typography, warm colours. 'Delhi, your Happiness Program starts in 5 days. 4 days to learn a technique that lasts a lifetime. Link in bio.'",
                    "stage_reference": "Instagram — Urgency & Conversion"
                },
                {
                    "day": 40,
                    "action": "Send Email 10: Final CTA — 'This Is Your Moment'",
                    "channel": "email",
                    "description": "Warm but decisive final email. Recap the key promise, the science, and the lifetime value. Clear registration link. 'We'd love to have you. Register now.'",
                    "stage_reference": "Email — Solution & Conversion"
                },
                {
                    "day": 41,
                    "action": "Send Message 13: Personal Plea",
                    "channel": "whatsapp",
                    "description": "A heartfelt, personal message: 'I really think this could help you. Just 4 days. You deserve to feel lighter.' Registration link.",
                    "stage_reference": "WhatsApp — Final Push"
                },
                {
                    "day": 42,
                    "action": "Publish Post 14: Final CTA Post",
                    "channel": "instagram",
                    "description": "'Tomorrow changes everything. Happiness Program with Rajni Chowdhary. May 6, Delhi. Register now.' Clean, direct, all key details. Organic post.",
                    "stage_reference": "Instagram — Urgency & Conversion"
                },
                {
                    "day": 43,
                    "action": "Send Message 14: Last Chance",
                    "channel": "whatsapp",
                    "description": "'Last chance to join tomorrow's Happiness Program. Here's the link: www.registrationlink.com. I'd love to see you there.' Warm, final nudge.",
                    "stage_reference": "WhatsApp — Final Push"
                }
            ],
            "days_covered": "Days 36-43"
        }
    ],
    "channel_plan": {
        "email": {
            "stages": [
                {
                    "count": 3,
                    "purpose": "Make the reader confront their stress honestly — normalise the struggle while planting the seed that there's a better way.",
                    "day_range": [
                        1,
                        12
                    ],
                    "stage_name": "Problem Awareness",
                    "content_direction": "Email 1: 'The stress you're carrying isn't normal' — a warm, personal note about how Delhi professionals have normalised exhaustion. Email 2: 'What poor sleep is really doing to you' — focus on sleep deprivation's hidden costs (focus, immunity, mood). Email 3: 'You've tried apps and gyms — why nothing sticks' — validate their past attempts and introduce the idea that breath is the missing piece."
                },
                {
                    "count": 4,
                    "purpose": "Deepen urgency by showing the compounding cost of inaction, while introducing Sudarshan Kriya and its scientific credibility.",
                    "day_range": [
                        13,
                        28
                    ],
                    "stage_name": "Agitation & Education",
                    "content_direction": "Email 4: 'What happens to your body after 5 years of chronic stress' — agitate with health consequences. Email 5: 'A breathing technique studied by Yale and Harvard' — introduce SKY meditation with research highlights (87.5% cortisol reduction, 71% anxiety relief). Email 6: 'Meet Rajni Chowdhary — your guide for 4 days that could change everything' — humanise the instructor. Email 7: 'What 500 million people across 182 countries already know' — scale and social proof to build trust."
                },
                {
                    "count": 3,
                    "purpose": "Present the Happiness Program as the clear next step, handle objections, and drive registration.",
                    "day_range": [
                        29,
                        43
                    ],
                    "stage_name": "Solution & Conversion",
                    "content_direction": "Email 8: 'Here's exactly what happens in 4 days' — break down the program format, benefits, and what participants receive (including lifetime free practice groups). Email 9: 'Your questions, answered' — FAQ-style email addressing time commitment, no prior experience needed, medical accommodations, online option. Email 10: 'This is your moment — register now' — final warm but urgent CTA with registration link, sent 3-4 days before launch."
                }
            ],
            "rationale": "Over 43 days, 10 emails (roughly one every 4-5 days) maintain steady presence without overwhelming inboxes. The sequence mirrors the PAS arc: early emails name the stress problem, mid-campaign emails agitate with data on what chronic stress does, and later emails present the Happiness Program as the clear solution with a strong CTA. Each email deepens the relationship and builds toward a registration decision.",
            "total_count": 10,
            "journey_type": "nurture_sequence"
        },
        "whatsapp": {
            "stages": [
                {
                    "count": 3,
                    "purpose": "Open the conversation warmly, build rapport, and surface the stress problem gently.",
                    "day_range": [
                        1,
                        10
                    ],
                    "stage_name": "Warm Introduction",
                    "content_direction": "Message 1: A warm greeting + a relatable question ('How are you really doing? Not the polite answer — the honest one.'). Message 2: Share a simple breathing tip they can try right now (e.g., 4-count exhale for instant calm) — give value first. Message 3: A short note about how most Delhi professionals are running on fumes and don't realise it — plant curiosity about a deeper solution."
                },
                {
                    "count": 4,
                    "purpose": "Introduce the Happiness Program naturally, share proof points, and make it feel relevant to their life.",
                    "day_range": [
                        11,
                        22
                    ],
                    "stage_name": "Build Interest",
                    "content_direction": "Message 4: 'Something I want to share with you' — introduce the Happiness Program as a personal recommendation, not a sales pitch. Message 5: Share one powerful research stat (e.g., 87.5% cortisol drop from first session) with a line like 'I couldn't believe this either until I saw the studies.' Message 6: Brief note about Rajni Chowdhary — who she is, why she teaches this, her warmth. Message 7: Share what participants get after the program (lifetime free practice groups, daily technique) — emphasise long-term value."
                },
                {
                    "count": 4,
                    "purpose": "Deepen desire through outcomes and community proof, handle silent objections.",
                    "day_range": [
                        23,
                        35
                    ],
                    "stage_name": "Desire & Social Proof",
                    "content_direction": "Message 8: 'Imagine waking up actually rested' — paint a picture of life after the program. Message 9: '500 million people in 182 countries practise this — Delhi's batch is coming up on May 6.' Message 10: Address common hesitations casually — 'No yoga experience needed. No chanting. Just breathing.' Message 11: 'I saved you a spot' energy — warm nudge with registration link."
                },
                {
                    "count": 3,
                    "purpose": "Create gentle urgency and make registration the obvious next step.",
                    "day_range": [
                        36,
                        43
                    ],
                    "stage_name": "Final Push",
                    "content_direction": "Message 12: 'One week to go — seats are filling up for the May 6 batch.' Message 13: A personal voice-note style message (text) — 'I really think this could help you. Just 4 days.' Message 14: Day before or day of — 'Last chance to join tomorrow's Happiness Program. Here's the link. I'd love to see you there.'"
                }
            ],
            "rationale": "WhatsApp is Delhi's primary communication channel and feels deeply personal. 14 messages over 43 days (roughly 1 every 3 days) keeps the conversation alive without being spammy. The tone is conversational — like a friend sharing something meaningful. WhatsApp allows for quick replies, voice notes, and direct registration nudges that email cannot match.",
            "total_count": 14,
            "journey_type": "personal_nurture",
            "audience_context": "Known contacts — existing leads, past enquirers, community members, and referrals from Rajni Chowdhary's network and Art of Living Delhi contacts. Messages feel like they come from Rajni or her team personally."
        },
        "instagram": {
            "stages": [
                {
                    "count": 4,
                    "purpose": "Stop the scroll by naming the audience's pain in relatable, Delhi-specific ways. Build brand presence.",
                    "day_range": [
                        1,
                        12
                    ],
                    "stage_name": "Problem Awareness & Hook",
                    "content_direction": "Post 1 (Educational): Static carousel — '5 signs your body is begging you to slow down' (poor sleep, brain fog, irritability, fatigue, shallow breathing). Clean, warm design. Post 2 (Storytelling): Single image with text overlay — a first-person narrative snippet: 'I thought exhaustion was just part of being successful in Delhi. Then I learned to breathe.' Post 3 (Engagement): Poll/question post — 'When was the last time you woke up genuinely rested?' with calming visual. Post 4 (Educational): Infographic — 'What chronic stress does to your brain, heart, and sleep — the science' with simple icons."
                },
                {
                    "count": 4,
                    "purpose": "Introduce Sudarshan Kriya and the Happiness Program as a credible, science-backed solution. Build trust.",
                    "day_range": [
                        13,
                        25
                    ],
                    "stage_name": "Solution Introduction",
                    "content_direction": "Post 5 (Educational): Static infographic — 'A breathing technique studied by Yale & Harvard: Sudarshan Kriya' — highlight 87.5% cortisol reduction, 71% anxiety relief stats. Post 6 (Social Proof): Quote card — 'Practised by 500 million people in 182 countries. Featured in UN and WHO programmes.' Clean, authoritative design. Post 7 (Product Showcase): Programme details card — 'The Happiness Program: 4 days. Breath. Meditation. Yoga. Life tools. Led by Rajni Chowdhary. May 6, Delhi.' With registration link in bio. Post 8 (Storytelling): Before/after narrative image — 'Before: 3am anxiety spirals. After: sleeping through the night. All I changed was how I breathe.'"
                },
                {
                    "count": 4,
                    "purpose": "Deepen credibility, showcase the instructor, and paint a picture of post-program life.",
                    "day_range": [
                        26,
                        37
                    ],
                    "stage_name": "Trust & Desire Building",
                    "content_direction": "Post 9 (Social Proof): Research highlight card — '70+ peer-reviewed studies. 4 continents. The science behind Sudarshan Kriya.' Post 10 (Storytelling): Image post about the instructor — 'Meet Rajni Chowdhary: your guide to rediscovering calm. May 6, Delhi.' Warm photo with brief bio. Post 11 (Educational): Carousel — 'What you get from the Happiness Program' — breakdown of Kriya, pranayama, yoga, meditation, lifetime free practice groups. Post 12 (Social Proof): Scale visual — map or number graphic showing 182 countries, 500M+ practitioners. 'Join the world's largest breathing community. Delhi batch: May 6.'"
                },
                {
                    "count": 2,
                    "purpose": "Drive final registrations with clear CTAs and countdown energy.",
                    "day_range": [
                        38,
                        43
                    ],
                    "stage_name": "Urgency & Conversion",
                    "content_direction": "Post 13 (Engagement): Countdown post — 'Delhi, your Happiness Program starts in 5 days. 4 days to learn a technique that lasts a lifetime. Link in bio.' Bold typography, warm colours. Post 14 (Product Showcase): Final CTA post — 'Tomorrow changes everything. Happiness Program with Rajni Chowdhary. May 6, Delhi. Register now.' Clean, direct, with all key details."
                }
            ],
            "rationale": "14 posts over 43 days (roughly 1 every 3 days) maintains consistent visibility on Delhi audiences' feeds. Each post is designed to stand completely alone — a new viewer should understand the value proposition from any single post. The mix balances education (research credibility), social proof (scale), emotional storytelling (transformation), and clear product information. Instagram drives top-of-funnel awareness that feeds into WhatsApp/email conversions.",
            "content_mix": {
                "engagement": 2,
                "educational": 4,
                "social_proof": 3,
                "storytelling": 3,
                "product_showcase": 2
            },
            "total_count": 14,
            "journey_type": "broadcast_awareness"
        }
    },
    "key_messages": [
        "Stress isn't a badge of honour — it's costing you your sleep, health, and joy. There's a way out.",
        "Sudarshan Kriya is backed by 70+ peer-reviewed studies from Yale, Harvard, and institutions across 4 continents — this isn't guesswork, it's science.",
        "In just 4 days, learn a breathing technique practised by over 500 million people in 182 countries that reduces cortisol by up to 87.5% from the very first session.",
        "No experience needed. No flexibility required. Just show up and breathe — Rajni Chowdhary will guide you through every step.",
        "This isn't a one-time event — you get lifetime access to free weekly practice groups worldwide, plus a daily practice you can do at home."
    ],
    "campaign_name": "Breathe Into Your Best Self — Delhi Happiness Program 2026",
    "target_persona": {
        "description": "A 28-38 year old working professional in Delhi — likely in IT, consulting, banking, or a startup — who works long hours, sleeps poorly, and carries tension in their body and mind. They've tried gym routines or meditation apps but nothing has stuck. They're open to wellness but skeptical of anything that feels too 'spiritual' without evidence. They trust peer recommendations and research-backed claims over influencer hype.",
        "motivations": [
            "Wanting to feel genuinely calm and energised — not just 'managing' stress",
            "Desire for a science-backed, structured approach rather than vague wellness advice",
            "Looking for a technique they can practise daily in under 30 minutes that actually works long-term",
            "Seeking community and accountability — not wanting to do the wellness journey alone"
        ],
        "pain_points": [
            "Chronic stress and mental fatigue from demanding work schedules with no real recovery mechanism",
            "Poor sleep quality — waking up tired despite being in bed for 7-8 hours",
            "Emotional flatness or irritability that's affecting relationships and personal satisfaction",
            "Tried meditation apps or yoga classes but couldn't sustain a practice or feel meaningful results"
        ]
    },
    "strategy_summary": "The campaign targets Delhi's overworked professionals who are stuck in a cycle of stress, poor sleep, and emotional numbness — and positions the Happiness Program as a 4-day reset backed by science and taught by Rajni Chowdhary. Weeks 1-2 focus on naming the problem (chronic stress as a silent epidemic among urban professionals) and building awareness. Weeks 3-4 agitate the cost of inaction while introducing the solution through research data and real outcomes. Weeks 5-6 drive urgency and conversion by showcasing social proof at scale (500M+ participants, 70+ studies, Yale/Harvard research) and making registration feel like a decisive, empowering step. The tone stays warm and never preachy — like a trusted friend who found something that genuinely works.",
    "budget_allocation": {
        "total": 5000,
        "breakdown": {
            "instagram_ads": {
                "amount": 4000,
                "purpose": "Boost 4-5 high-performing posts (especially educational and social proof posts) targeting working professionals aged 25-45 in Delhi NCR. Focus on reach and link clicks to registration page. Split between awareness (first 3 weeks) and conversion (last 2 weeks) objectives."
            },
            "email_platform": {
                "amount": 500,
                "purpose": "Email marketing tool subscription (e.g., Brevo/Sendinblue free-to-low tier) for the 10-email sequence with scheduling, tracking, and basic automation."
            },
            "whatsapp_business_tools": {
                "amount": 500,
                "purpose": "WhatsApp Business API costs for broadcast lists and message delivery to contact database. Covers any per-message charges for the 14-message sequence."
            }
        },
        "rationale": "With a ₹5,000 budget, the highest ROI comes from concentrating 80% on Instagram paid promotion — this is the only channel that reaches strangers and builds the top of funnel. Email and WhatsApp are essentially free channels (contacts already known), so they need only minimal tool costs. Instagram ads targeted to Delhi professionals aged 25-45 with interests in wellness, meditation, yoga, and self-improvement will drive the bulk of new awareness and registration page visits."
    },
    "expected_outcomes": {
        "primary_kpi": "Total registrations for the May 6 Happiness Program via www.registrationlink.com",
        "secondary_kpis": [
            "Registration page click-through rate from Instagram ads",
            "Email open rate and click-through rate across the 10-email sequence",
            "WhatsApp message read rate and reply rate",
            "Instagram post engagement rate (saves, shares, comments) on boosted posts",
            "Cost per registration page visit from paid Instagram promotion"
        ],
        "success_criteria": "A full or near-full batch for the May 6 Delhi Happiness Program, with a measurable pipeline of warm leads who didn't register this time but can be nurtured for future batches. Instagram reach should exceed 50,000 unique Delhi-based professionals, email open rates should average 25%+, and WhatsApp should generate direct conversations and replies leading to registrations."
    },
    "campaign_duration_days": 43,
    "no_contact_data_notice": "This campaign strategy is complete and ready to execute. However, customer contact data (email addresses and WhatsApp phone numbers) has not yet been provided. Before launching the email and WhatsApp sequences, please upload your contact list segmented by channel. The Instagram component can begin immediately as it targets a public audience through paid promotion. Once contacts are uploaded, the email and WhatsApp sequences will be activated according to the weekly plan timeline."
},

    // Email Templates (10)
    email_templates: [
    {
        "id": "demo-hp-email-1",
        "template_order": 1,
        "subject": "The stress you're carrying isn't normal",
        "pre_header": "Dear Delhi professional — when did exhaustion become your default setting?",
        "body": "<p>Hi {{first_name}},</p><p>Let me ask you something honest — when was the last time you woke up genuinely <strong>rested</strong>? Not just functional. Not just caffeinated enough to get through the day. But truly, deeply rested?</p><p>If you're a working professional in Delhi, chances are you've forgotten what that feels like. The long commutes, the back-to-back meetings, the constant notifications, the pressure to perform — it's relentless. And somewhere along the way, you started believing this was just <strong>how life works</strong>.</p><p>But here's what I want you to sit with today: <strong>stress isn't a badge of honour.</strong> It's not proof that you're working hard enough. It's your body quietly telling you something needs to change.</p><p>You might notice it as that tightness in your shoulders that never fully goes away. Or the irritability that spills over into your relationships. Or the way your mind races at 2 AM even though your body is exhausted.</p><p>You're not alone in this. Millions of professionals across Delhi are living in this exact cycle — and most have simply stopped questioning it.</p><p>But what if there was a way to break free? Not by quitting your job or escaping to the mountains — but by learning something so simple, so accessible, that you could practise it every morning in your own home?</p><p>Over the next few weeks, I'm going to share something with you that has genuinely transformed lives. No hype. No fluff. Just science, breath, and a little bit of hope.</p><p>Stay with me. This could be the beginning of something beautiful.</p><p>Warmly,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Discover the Happiness Program →</a></p>",
        "cta_text": "Discover the Happiness Program",
        "scheduled_day": 1
    },
    {
        "id": "demo-hp-email-2",
        "template_order": 2,
        "subject": "What poor sleep is really doing to you",
        "pre_header": "It's not just tiredness — the hidden costs of sleep deprivation are serious.",
        "body": "<p>Hi {{first_name}},</p><p>You probably already know you're not sleeping well. But have you ever stopped to think about what that's <strong>actually costing you</strong>?</p><p>When you consistently miss out on deep, restorative sleep, the effects go far beyond feeling groggy:</p><ul><li><strong>Your focus fractures.</strong> That sharp mind you pride yourself on? It starts making more mistakes, missing details, struggling to hold attention in meetings.</li><li><strong>Your immunity drops.</strong> You catch every cold that goes around the office. Recovery takes longer. Your body feels heavier.</li><li><strong>Your mood shifts.</strong> Patience thins. Small things start to feel overwhelming. You snap at people you love — and then feel guilty about it.</li></ul><p>Sleep isn't a luxury, {{first_name}}. It's the foundation your entire life runs on. And when that foundation cracks, everything built on top of it starts to wobble.</p><p>Here's something remarkable: research has shown that practitioners of a specific breathing technique called <strong>Sudarshan Kriya</strong> spend <strong>3x more time in deep, restorative stages of sleep</strong>. Not through pills. Not through supplements. Through <strong>breath</strong>.</p><p>Imagine waking up tomorrow feeling genuinely refreshed — your mind clear, your body light, your heart at ease. That's not a fantasy. It's what thousands of Delhi professionals have already experienced.</p><p>I'll tell you more soon. For now, just notice tonight — how does your body feel when you finally lie down?</p><p>With care,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Learn How to Sleep Better →</a></p>",
        "cta_text": "Learn How to Sleep Better",
        "scheduled_day": 5
    },
    {
        "id": "demo-hp-email-3",
        "template_order": 3,
        "subject": "You've tried apps and gyms — here's why",
        "pre_header": "What if the missing piece was something you've been doing since birth?",
        "body": "<p>Hi {{first_name}},</p><p>If you're like most professionals I know in Delhi, you've already <strong>tried</strong> to fix the stress. Maybe you downloaded a meditation app — used it for a week, then forgot about it. Maybe you signed up for a gym membership that turned into another source of guilt. Maybe you tried journaling, cold showers, or that trending wellness hack on Instagram.</p><p>And none of it stuck. Not really.</p><p>Here's why: most of these approaches work on the <strong>surface</strong>. They address symptoms — tight muscles, racing thoughts, restless nights — without reaching the <strong>root</strong> of what's keeping you stuck.</p><p>The root is in your <strong>breath</strong>.</p><p>Think about it — when you're anxious, your breathing becomes shallow and rapid. When you're angry, it's heavy and forceful. When you're calm, it flows gently. <strong>Your breath and your emotions are deeply connected.</strong> But almost no one teaches you how to use that connection intentionally.</p><p>That's exactly what the <strong>Happiness Program</strong> does. Over 4 days, you learn <strong>Sudarshan Kriya</strong> — a powerful rhythmic breathing technique that works directly on your nervous system to dissolve accumulated stress at its deepest level. No flexibility required. No prior experience needed.</p><p>It's not another thing to add to your to-do list. It's a <strong>20-minute daily practice</strong> that becomes the anchor your entire day revolves around.</p><p>The missing piece was never discipline. It was the right technique.</p><p>Warmly,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Find the Missing Piece →</a></p>",
        "cta_text": "Find the Missing Piece",
        "scheduled_day": 10
    },
    {
        "id": "demo-hp-email-4",
        "template_order": 4,
        "subject": "5 years of chronic stress — what it costs you",
        "pre_header": "The real price isn't paid at your desk. It's paid in your body and relationships.",
        "body": "<p>Hi {{first_name}},</p><p>Let's fast-forward five years. Imagine nothing changes — same pace, same pressure, same sleepless nights, same tension in your body.</p><p>What does that look like?</p><p>Research paints a sobering picture of what <strong>prolonged, unmanaged stress</strong> does to the human body and mind:</p><ul><li><strong>Your heart pays the price.</strong> Chronic stress elevates cortisol and blood pressure, significantly increasing cardiovascular risk over time.</li><li><strong>Your relationships erode.</strong> When you're running on empty, you have nothing left to give. Patience disappears. Intimacy fades. The people closest to you start feeling like strangers.</li><li><strong>Your clarity dims.</strong> Decision fatigue sets in. Creativity dries up. You start operating on autopilot — surviving, not living.</li><li><strong>Your joy quietly disappears.</strong> The things that once excited you — a weekend trip, a good book, a meal with friends — start feeling flat.</li></ul><p>This isn't meant to frighten you, {{first_name}}. It's meant to <strong>wake you up</strong>. Because the cost of doing nothing isn't zero — it compounds silently, day after day.</p><p>The good news? <strong>Your body is remarkably resilient.</strong> With the right tools, the damage can be reversed. The calm can return. The joy can come back.</p><p>And it starts with something as simple — and as profound — as <strong>learning to breathe differently</strong>.</p><p>In my next email, I'll share the science behind a technique that has caught the attention of researchers at Yale and Harvard. You'll want to see this.</p><p>With warmth,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Start Your Reset →</a></p>",
        "cta_text": "Start Your Reset",
        "scheduled_day": 15
    },
    {
        "id": "demo-hp-email-5",
        "template_order": 5,
        "subject": "Yale & Harvard studied this breathing technique",
        "pre_header": "87.5% cortisol reduction. 71% anxiety relief. Here's the research.",
        "body": "<p>Hi {{first_name}},</p><p>I promised you science. Here it is.</p><p><strong>Sudarshan Kriya</strong> — the core breathing technique taught in the Happiness Program — has been studied in over <strong>70 independent, peer-reviewed research papers</strong> conducted across four continents. This isn't wellness marketing. This is data from institutions including <strong>Yale and Harvard</strong>.</p><p>Here's what the research shows:</p><ul><li><strong>Up to 87.5% reduction in cortisol</strong> (the stress hormone) — from the very first session</li><li><strong>71% of participants</strong> experienced significant anxiety relief — even those for whom medication and therapy had previously failed</li><li><strong>67–73% relief from depression</strong> within just one month of regular practice</li><li><strong>3x more time</strong> spent in deep, restorative stages of sleep</li><li>Measurable improvements in <strong>immunity, heart health, mental focus, and emotional resilience</strong></li></ul><p>Read those numbers again, {{first_name}}. This isn't a placebo effect. This is a <strong>rhythmic breathing technique</strong> created by Gurudev Sri Sri Ravi Shankar in 1982 that has now been practised by over <strong>500 million people in 182 countries</strong>.</p><p>It works by using specific natural rhythms of the breath to harmonise your nervous system — dissolving accumulated stress at a level that talk therapy and fitness routines simply can't reach.</p><p>And the beautiful part? <strong>You don't need any prior experience.</strong> You just need to show up and breathe.</p><p>Curious to know who'll be guiding you through this in Delhi? I'll introduce her next.</p><p>Warmly,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Explore the Happiness Program →</a></p>",
        "cta_text": "Explore the Happiness Program",
        "scheduled_day": 19
    },
    {
        "id": "demo-hp-email-6",
        "template_order": 6,
        "subject": "Meet Rajni Chowdhary — your guide for 4 days",
        "pre_header": "She's walked the same path you're on — and found a way through.",
        "body": "<p>Hi {{first_name}},</p><p>Behind every transformative experience is a guide who truly understands the journey. For the upcoming Happiness Program in Delhi, that guide is <strong>Rajni Chowdhary</strong>.</p><p>Rajni is a certified Art of Living instructor who has dedicated herself to sharing the gift of <strong>Sudarshan Kriya</strong> and the tools of the Happiness Program with people just like you — busy, driven professionals who are carrying more stress than they realise.</p><p>What makes her sessions special isn't just her expertise — it's her <strong>warmth</strong>. She creates a space where you don't need to perform or pretend. You don't need to be flexible, spiritual, or experienced. You just need to be <strong>willing</strong>.</p><p>Over 4 days, Rajni will personally guide you through:</p><ul><li><strong>Sudarshan Kriya™</strong> — the flagship breathing technique</li><li><strong>Pranayamas</strong> — yogic breathing exercises to calm your nervous system</li><li><strong>Gentle yoga and guided meditation</strong> — accessible to absolute beginners</li><li><strong>Practical wisdom sessions</strong> — tools for managing emotions, improving relationships, and navigating life's challenges</li></ul><p>Every step is personalised. If you have any medical conditions — asthma, back pain, hypertension — Rajni ensures you receive individual guidance so you feel completely safe.</p><p>This isn't a lecture hall. It's a small group setting designed for <strong>real connection and personal attention</strong>.</p><p>Think of it as 4 days with a trusted friend who happens to hold the key to something extraordinary.</p><p>With warmth,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Join Rajni's Program →</a></p>",
        "cta_text": "Join Rajni's Program",
        "scheduled_day": 23
    },
    {
        "id": "demo-hp-email-7",
        "template_order": 7,
        "subject": "500 million people already know this secret",
        "pre_header": "From Delhi to New York, from UN halls to living rooms — this practice travels.",
        "body": "<p>Hi {{first_name}},</p><p>Sometimes the best proof that something works isn't a research paper — it's <strong>scale</strong>.</p><p>The Happiness Program and Sudarshan Kriya have now reached over <strong>500 million people across 182 countries</strong>. Let that sink in for a moment. Half a billion people — from college students in Mumbai to executives in New York, from veterans recovering from PTSD to UN delegates seeking clarity — have all turned to this one practice.</p><p>Here's what that kind of scale tells you:</p><ul><li><strong>It works across cultures.</strong> This isn't a trend that appeals to one demographic. It resonates with people from every background, every age group, every walk of life.</li><li><strong>It works across institutions.</strong> The programme has been adopted by the <strong>United Nations, the World Health Organization, and the World Economic Forum</strong>. It's used in corporate wellness programmes, military rehabilitation, and prison reform initiatives worldwide.</li><li><strong>It works across time.</strong> Since 1982, when Gurudev Sri Sri Ravi Shankar first shared Sudarshan Kriya, the practice hasn't faded — it has <strong>grown exponentially</strong>. That doesn't happen with gimmicks.</li></ul><p>And here's the part that might surprise you: after completing the programme, you receive <strong>lifetime access to free weekly Sudarshan Kriya practice groups</strong> at thousands of Art of Living centres worldwide. Whether you're in Delhi, Bangalore, London, or Tokyo — your practice community travels with you.</p><p>You're not joining a workshop. You're joining a <strong>global family</strong>.</p><p>Warmly,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Join 500 Million+ People →</a></p>",
        "cta_text": "Join 500 Million+ People",
        "scheduled_day": 27
    },
    {
        "id": "demo-hp-email-8",
        "template_order": 8,
        "subject": "Here's exactly what happens in 4 days",
        "pre_header": "No mystery, no surprises — just a clear path to feeling lighter and calmer.",
        "body": "<p>Hi {{first_name}},</p><p>You've heard the science. You've seen the scale. Now let me show you exactly what the <strong>Happiness Program</strong> looks like — day by day — so you know precisely what you're stepping into.</p><p><strong>The Format:</strong></p><ul><li><strong>4 consecutive days</strong>, approximately 3–4 hours per day</li><li>Small group setting with <strong>personalised attention</strong> from Rajni Chowdhary</li><li>Available <strong>in-person in Delhi</strong> (and online in select formats)</li></ul><p><strong>What You'll Experience:</strong></p><ul><li><strong>Sudarshan Kriya™</strong> — the core rhythmic breathing technique that releases stress at its deepest root</li><li><strong>Pranayamas</strong> — yogic breathing exercises including Nadi Shodhana, Bhastrika, and Ujjayi to regulate your nervous system</li><li><strong>Gentle yoga postures</strong> — simple, accessible movements to release physical tension (no flexibility needed!)</li><li><strong>Guided meditation</strong> — daily sessions to access stillness and inner clarity</li><li><strong>Interactive wisdom sessions</strong> — practical tools for managing emotions, improving relationships, and building resilience</li></ul><p><strong>What You Take Home:</strong></p><ul><li>A <strong>daily morning breathing practice</strong> you can do at home</li><li><strong>Lifetime free access</strong> to weekly Sudarshan Kriya practice groups at Art of Living centres across 182+ countries</li><li>A <strong>global community</strong> of like-minded practitioners</li></ul><p>Four days. Three to four hours a day. A practice that stays with you for life. That's one of the best investments you'll ever make in yourself, {{first_name}}.</p><p>With love,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Reserve Your Spot Now →</a></p>",
        "cta_text": "Reserve Your Spot Now",
        "scheduled_day": 31
    },
    {
        "id": "demo-hp-email-9",
        "template_order": 9,
        "subject": "Your questions about the program, answered",
        "pre_header": "No experience needed. Medical conditions welcome. Here's everything you need to know.",
        "body": "<p>Hi {{first_name}},</p><p>I know that signing up for something new — especially something that involves your wellbeing — comes with questions. So let me answer the ones I hear most often:</p><p><strong>\"I've never done yoga or meditation. Can I still join?\"</strong><br>Absolutely. The Happiness Program is <strong>completely beginner-friendly</strong>. No prior experience with yoga, meditation, or breathwork is required. Rajni Chowdhary guides you through every step — gently and at your own pace.</p><p><strong>\"I have asthma / back pain / hypertension. Is it safe?\"</strong><br>Yes. Participants with medical conditions receive <strong>personalised guidance</strong> from the instructor during sessions. The practices are adapted to ensure your comfort and safety.</p><p><strong>\"I can't commit 4 full days — how much time does it take?\"</strong><br>Each day involves approximately <strong>3–4 hours</strong> of guided sessions. Many working professionals attend after office hours or over a long weekend. Think of it as giving yourself <strong>just 16 hours</strong> that could transform the other 8,744 hours of your year.</p><p><strong>\"Is there an online option?\"</strong><br>Yes, the programme is available online in select formats. Check the registration page for current availability in Delhi.</p><p><strong>\"What happens after the 4 days?\"</strong><br>You receive a daily home practice plus <strong>lifetime free access</strong> to weekly Sudarshan Kriya group sessions at Art of Living centres worldwide. The support never stops.</p><p>No more reasons to wait, {{first_name}}. Just one decision that could change everything.</p><p>Warmly,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Register for the Program →</a></p>",
        "cta_text": "Register for the Program",
        "scheduled_day": 36
    },
    {
        "id": "demo-hp-email-10",
        "template_order": 10,
        "subject": "This is your moment, {{first_name}}",
        "pre_header": "The Happiness Program in Delhi is days away. Your seat is waiting.",
        "body": "<p>Hi {{first_name}},</p><p>We've talked about the stress you carry. The sleep you've lost. The apps that didn't stick. The silent cost of doing nothing year after year.</p><p>And we've talked about the way out — a <strong>4-day program</strong> built around a breathing technique backed by <strong>70+ peer-reviewed studies</strong>, practised by over <strong>500 million people</strong>, and validated by researchers at <strong>Yale and Harvard</strong>.</p><p>Now it comes down to this: <strong>are you going to keep waiting, or are you going to breathe?</strong></p><p>The <strong>Happiness Program in Delhi</strong>, led by <strong>Rajni Chowdhary</strong>, is just days away. Here's what's waiting for you:</p><ul><li>Sudarshan Kriya™ — the technique that reduces cortisol by up to <strong>87.5%</strong> from the very first session</li><li>Gentle yoga, pranayama, and guided meditation — all beginner-friendly</li><li>Practical tools for emotional resilience, better relationships, and lasting inner peace</li><li><strong>Lifetime free access</strong> to weekly practice groups across 182+ countries</li></ul><p>No experience needed. No flexibility required. Just <strong>you, your breath, and the willingness to show up for yourself</strong>.</p><p>{{first_name}}, you've spent years pouring your energy into your career, your responsibilities, your commitments to others. This is <strong>4 days for you</strong>. Just you.</p><p>Your best self is waiting on the other side of one deep breath. Take it.</p><p>With all my heart,<br>Team Art of Living, Delhi</p><p><a href='https://www.registrationlink.com' style='background-color:#F59E0B;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;margin-top:16px;'>Register Now →</a></p>",
        "cta_text": "Register Now",
        "scheduled_day": 40
    }
],

    // WhatsApp Messages (14)
    whatsapp_messages: [
    {
        "id": "demo-hp-wa-1",
        "message_order": 1,
        "message_text": "Hi there! 😊\n\nIt's Rajni here. I hope you're doing well.\n\nBut can I ask you something honestly — how are you *really* doing? Not the \"sab theek hai\" answer we give everyone. The real one.\n\nBecause I've been talking to so many people in Delhi lately, and behind the \"I'm fine\" there's usually exhaustion, restless nights, and a mind that just won't switch off.\n\nIf that sounds familiar, I just want you to know — you're not alone. And there's something simple that can help.\n\nMore on that soon. For now, just reply and tell me — how are you really doing?",
        "message_type": "engagement",
        "scheduled_day": 1
    },
    {
        "id": "demo-hp-wa-2",
        "message_order": 2,
        "message_text": "Hey! Rajni again 🙏\n\nI promised something helpful, so here's a tiny breathing trick you can try right now — even at your desk:\n\n👉 Breathe in for 4 counts\n👉 Breathe out for 6 counts\n👉 Repeat 5 times\n\nThat's it. The longer exhale activates your body's natural calming response. Takes 90 seconds.\n\nI teach this in my workshops and people are always surprised how quickly it works.\n\nTry it now and let me know how you feel? Just reply with a 👍 or tell me what you noticed. I'd love to hear!",
        "message_type": "engagement",
        "scheduled_day": 4
    },
    {
        "id": "demo-hp-wa-3",
        "message_order": 3,
        "message_text": "Hi again! ☕\n\nSomething's been on my mind. I meet so many working professionals here in Delhi — smart, driven, ambitious people — and almost every single one is running on fumes.\n\nLate nights. Screen fatigue. That 3pm slump that coffee can't fix anymore. Snapping at loved ones over small things.\n\nWe've normalised stress so much that we wear it like a badge. But here's the thing — stress isn't a badge of honour. It's quietly costing us our sleep, our health, and our joy.\n\nWhat if there was a way to actually reset? Not a vacation. Something deeper.\n\nStay tuned — I have something to share with you soon 🌿\n\nReply \"Tell me more\" if you're curious!",
        "message_type": "announcement",
        "scheduled_day": 8
    },
    {
        "id": "demo-hp-wa-4",
        "message_order": 4,
        "message_text": "Hey! Something I've been wanting to share with you personally 💛\n\nThere's a program I teach called the *Happiness Program* by Art of Living. It's a 4-day workshop where I guide you through a powerful breathing technique called Sudarshan Kriya, along with yoga, meditation, and practical tools for daily life.\n\nI'm not sharing this as an ad — I'm sharing it because I've seen it genuinely change lives. People walk in stressed and exhausted, and by Day 4, there's a lightness in them that's hard to describe.\n\nA new batch is coming up in Delhi and I'd love for you to experience it.\n\nWant to know more? Just reply \"Yes\" and I'll share the details! 🙌",
        "message_type": "announcement",
        "scheduled_day": 12
    },
    {
        "id": "demo-hp-wa-5",
        "message_order": 5,
        "message_text": "Hi! Quick one for you today 🔬\n\nYou know I mentioned the Happiness Program and Sudarshan Kriya? Here's something that blew my mind when I first saw the research:\n\n👉 Over 70 peer-reviewed studies — including from *Yale and Harvard* — show that this breathing technique can reduce cortisol (your stress hormone) by up to *87.5%* from the very first session.\n\nI couldn't believe it either until I read the studies myself. This isn't guesswork — it's science.\n\nImagine what dropping that much stress could do for your sleep, your mood, your energy.\n\nWant me to send you the registration details for the Delhi batch? Just reply \"Send\" ✨\n\nwww.registrationlink.com",
        "message_type": "follow_up",
        "scheduled_day": 16
    },
    {
        "id": "demo-hp-wa-6",
        "message_order": 6,
        "message_text": "Hey! I realised I've told you about the program but not much about *me* 😄\n\nI'm Rajni Chowdhary — I've been teaching the Happiness Program for Art of Living here in Delhi. What drew me to this work is simple: I saw how deeply Sudarshan Kriya transformed my own life, and I couldn't keep it to myself.\n\nWhat I love most about teaching is watching someone who walked in saying \"nothing works for my stress\" leave on Day 4 with a genuine smile and a technique they can use every single morning.\n\nI guide every session personally. Small groups. Lots of warmth. Zero judgement.\n\nI'd truly love to have you in my next batch 🤗\n\nAny questions? Just reply here — I'm right here!",
        "message_type": "follow_up",
        "scheduled_day": 19
    },
    {
        "id": "demo-hp-wa-7",
        "message_order": 7,
        "message_text": "Hi! One thing people always ask me: \"What happens *after* the 4 days?\" 🤔\n\nGreat question. Here's what you get:\n\n✅ A daily breathing practice you can do at home every morning — takes minutes\n✅ *Lifetime* free access to weekly Sudarshan Kriya practice groups at Art of Living centres across 182+ countries\n✅ A supportive community of like-minded people\n✅ The ability to join practice sessions wherever you travel in the world\n\nThis isn't a one-time event that fades away. It's a tool you carry with you for life.\n\nThat's what makes this different from any workshop I've seen.\n\nReady to give yourself these 4 days? Register here 👇\nwww.registrationlink.com",
        "message_type": "follow_up",
        "scheduled_day": 22
    },
    {
        "id": "demo-hp-wa-8",
        "message_order": 8,
        "message_text": "Hey, close your eyes for a second and imagine this 🌅\n\nYou wake up tomorrow morning *actually* rested. No alarm snooze marathon. No heaviness.\n\nYou sit for 20 minutes of breathing practice. By the time you're done, your mind is quiet. Clear. You feel genuinely calm — not the fake \"I'm managing\" calm, but real stillness.\n\nYou go through your day with more patience, more energy, more presence. You don't snap. You don't crash at 4pm.\n\nThis is what participants tell me life feels like after the Happiness Program. And it starts with just 4 days.\n\nWant this for yourself? Let's make it happen 💛\n\nReply \"I'm in\" or register here: www.registrationlink.com",
        "message_type": "engagement",
        "scheduled_day": 25
    },
    {
        "id": "demo-hp-wa-9",
        "message_order": 9,
        "message_text": "Here's something that still gives me goosebumps 🌍\n\nOver *500 million people* across 182 countries practise Sudarshan Kriya. It's been adopted by the United Nations, used in military rehabilitation, corporate wellness programs, and disaster recovery worldwide.\n\nThis isn't some niche trend. It's a global movement — and it started with one breathing technique created by Gurudev Sri Sri Ravi Shankar in 1982.\n\nAnd now, Delhi's next batch is coming up on *May 6*.\n\nYou have a chance to experience what half a billion people already know works.\n\nDon't let this one pass by. Register now 👇\nwww.registrationlink.com\n\nOr just reply \"Details\" and I'll share everything you need!",
        "message_type": "announcement",
        "scheduled_day": 28
    },
    {
        "id": "demo-hp-wa-10",
        "message_order": 10,
        "message_text": "Hey! I wanted to quickly clear up something that holds a lot of people back 😊\n\n\"I'm not flexible enough for yoga.\"\n→ No flexibility needed. The yoga here is gentle and accessible.\n\n\"I've never meditated before.\"\n→ Perfect. This program is designed for complete beginners.\n\n\"I don't know any chanting or Sanskrit.\"\n→ None required. You just need to breathe — and I'll guide you through every step.\n\n\"I have a health condition.\"\n→ We provide personalised guidance for asthma, BP, back pain, etc.\n\nLiterally all you need to do is show up. That's it. I'll handle the rest.\n\nStill on the fence? Reply with your concern and I'll answer personally 🙏\n\nwww.registrationlink.com",
        "message_type": "follow_up",
        "scheduled_day": 31
    },
    {
        "id": "demo-hp-wa-11",
        "message_order": 11,
        "message_text": "Hey! Just a warm nudge from my side 💛\n\nI've been thinking about our conversations and I genuinely feel the Happiness Program could be something special for you.\n\nThe May 6 Delhi batch is filling up and I've mentally saved you a spot 😄\n\nIt's just 4 days. 3-4 hours each day. You'll learn Sudarshan Kriya, pranayama, meditation, and walk away with tools that stay with you for life.\n\nNo prior experience needed. Small group. Personal attention.\n\nI'd really love to see your name on the list.\n\nRegister here and let's do this 👇\nwww.registrationlink.com\n\nOr just reply \"Book\" and I'll help you get set up right away! 🙌",
        "message_type": "offer",
        "scheduled_day": 34
    },
    {
        "id": "demo-hp-wa-12",
        "message_order": 12,
        "message_text": "Hi! Quick update ⏳\n\nWe're exactly *one week away* from the May 6 Happiness Program batch in Delhi — and seats are filling up fast.\n\nI wanted to make sure you don't miss out. This is 4 days that could genuinely shift how you handle stress, sleep, and everything in between.\n\nRemember:\n🔬 87.5% cortisol reduction from the first session\n🌍 Practised by 500M+ people worldwide\n🎓 Backed by 70+ studies from Yale, Harvard & more\n💚 Lifetime access to free weekly practice groups\n\nThis is your week to decide. Don't overthink it — just breathe.\n\nRegister now: www.registrationlink.com\n\nQuestions? I'm one reply away 🙏",
        "message_type": "reminder",
        "scheduled_day": 37
    },
    {
        "id": "demo-hp-wa-13",
        "message_order": 13,
        "message_text": "Hey… this is a personal message from me, Rajni 🙏\n\nI know life is busy. I know there's always a reason to postpone something for yourself. \"Next month.\" \"When things settle down.\" I used to say the same things.\n\nBut here's what I've learned — things don't settle down. *You* settle down. And that's exactly what these 4 days teach you.\n\nI've watched hundreds of people walk into the Happiness Program carrying the weight of the world — and walk out breathing freely, smiling genuinely, sleeping deeply.\n\nI really think this could help you. Just 4 days. That's all I'm asking.\n\nWill you give yourself this? 💛\n\nwww.registrationlink.com\n\nReply \"I'm ready\" and I'll personally make sure you're all set.",
        "message_type": "follow_up",
        "scheduled_day": 40
    },
    {
        "id": "demo-hp-wa-14",
        "message_order": 14,
        "message_text": "Hey! Tomorrow is the day 🌟\n\nThe Happiness Program starts May 6 — and this is your last chance to join.\n\nIn just 4 days, you'll learn Sudarshan Kriya, the breathing technique that's transformed over 500 million lives across 182 countries. You'll walk away calmer, clearer, and with a daily practice that stays with you forever.\n\nNo experience needed. I'll guide you through everything.\n\nI'd truly love to see you there.\n\n👉 Register now: www.registrationlink.com\n\nOr call/reply to me right now and I'll get you in.\n\nLet's breathe into your best self, Delhi 💛🙏\n\nSee you tomorrow!",
        "message_type": "reminder",
        "scheduled_day": 43
    }
],

    // Social Posts (14)
    social_posts: [
    {
        "id": "demo-hp-post-1",
        "post_order": 1,
        "caption": "Your body is already telling you something. You're just too busy to listen.\n\n5 signs you need to slow down:\n🔴 You can't remember your last deep sleep\n🔴 Brain fog hits by 2pm\n🔴 Small things make you snap\n🔴 You're always tired — even after weekends\n🔴 Your breathing is shallow and tight\n\nStress isn't a badge of honour. It's costing you everything.\n\nStart paying attention. Your body is keeping score.",
        "hashtags": "#StressRelief #DelhiWellness #MentalHealthMatters #BurnoutRecovery #WorkLifeBalance #BreatheDeep #WellnessIndia #HealthyLiving",
        "post_type": "single_image",
        "scheduled_day": 1,
        "image_suggestion": "A warm-toned, clean infographic card with a soft beige or muted terracotta background. Five horizontal rows, each with a simple, elegant line-drawn illustration (a restless pillow, a foggy head silhouette, a cracked fuse, a drained battery, a compressed lung) next to short text for each sign. Modern sans-serif typography. No faces. Feels editorial and calming, not clinical.",
        "image_url": "/demo-assets/post-1.png"
    },
    {
        "id": "demo-hp-post-2",
        "post_order": 2,
        "caption": "I wore my exhaustion like a medal.\n\n12-hour days. Weekend emails. Coffee as a personality trait. I told myself — this is what it takes to make it in Delhi.\n\nThen my sleep collapsed. My patience vanished. My body started keeping score.\n\nOne day, someone said: \"What if you just learned to breathe differently?\"\n\nI laughed. Then I tried it.\n\nThat was the turning point I didn't know I needed.\n\nYour breakthrough might be closer than you think.",
        "hashtags": "#DelhiLife #StressStory #MentalWellness #BreatheItOut #WellnessJourney #ArtOfLiving #HealingBegins",
        "post_type": "single_image",
        "scheduled_day": 4,
        "image_suggestion": "A single moody photograph-style image: a person seen from behind, sitting alone at a cluttered work desk late at night, laptop glowing, city lights of a metro skyline visible through a window. Warm amber desk lamp contrasts with cool blue screen light. Anonymous figure — no face visible. Evokes the quiet exhaustion of hustle culture. Cinematic, relatable, emotional.",
        "image_url": "/demo-assets/post-2.png"
    },
    {
        "id": "demo-hp-post-3",
        "post_order": 3,
        "caption": "Be honest 👇\n\nWhen was the last time you woke up genuinely rested — no alarm, no grogginess, no dread?\n\n☀️ This morning\n📅 Last week\n🤔 Can't remember\n😶 ...What's \"rested\"?\n\nIf you had to think about it, that's your answer.\n\nGood sleep isn't a luxury. It's the foundation of everything — your mood, focus, health, and joy.\n\nDrop your answer below. Let's talk about it.",
        "hashtags": "#SleepBetter #DelhiProfessionals #StressAwareness #WellnessCheck #MindBodyHealth #RestMatters #SelfCareIndia",
        "post_type": "single_image",
        "scheduled_day": 8,
        "image_suggestion": "A calming, minimal design: soft lavender or deep navy gradient background with large, clean white typography asking 'When did you last wake up truly rested?' with the four poll options styled as gentle rounded buttons below. A single subtle crescent moon illustration in one corner. Feels like a quiet invitation, not a loud graphic. Elegant and scroll-stopping.",
        "image_url": "/demo-assets/post-3.png"
    },
    {
        "id": "demo-hp-post-4",
        "post_order": 4,
        "caption": "Chronic stress isn't just \"feeling busy.\" It's silently rewiring your body.\n\n🧠 Brain: Shrinks your prefrontal cortex. Memory and focus decline.\n❤️ Heart: Elevated cortisol raises blood pressure and inflammation.\n😴 Sleep: Disrupts deep restorative sleep — you rest but never recover.\n\nThis isn't meant to scare you. It's meant to wake you up.\n\nThe good news? Your breath can reverse this. Science says so.\n\nDon't wait for a breakdown to pay attention.",
        "hashtags": "#StressScience #ChronicStress #WellnessFacts #HealthAwareness #DelhiHealth #BreatheToHeal #MindBodyConnection",
        "post_type": "single_image",
        "scheduled_day": 12,
        "image_suggestion": "A clean, modern infographic on a crisp white background with three horizontal sections. Each section features a simple, elegant anatomical illustration — a brain, a heart, a sleep wave pattern — in muted coral and grey tones, paired with 1-line impact text. No clipart or cartoon icons. Medical-editorial style that feels trustworthy and intelligent. Subtle Art of Living branding at bottom.",
        "image_url": "/demo-assets/post-4.png"
    },
    {
        "id": "demo-hp-post-5",
        "post_order": 5,
        "caption": "What if a breathing technique could do what pills couldn't?\n\nSudarshan Kriya — studied by Yale, Harvard, and institutions across 4 continents:\n\n📉 Up to 87.5% cortisol reduction from the very first session\n📉 71% anxiety relief in people where medication had failed\n📉 67-73% depression relief within one month\n📈 3x more time in deep, restorative sleep\n\n70+ peer-reviewed studies. This isn't guesswork — it's science.\n\nLearn it in just 4 days. Delhi batch open now.\n🔗 Link in bio",
        "hashtags": "#SudarshanKriya #ScienceOfBreath #YaleResearch #StressRelief #AnxietyRelief #ArtOfLiving #DelhiWorkshop #BreathworkIndia",
        "post_type": "single_image",
        "scheduled_day": 15,
        "image_suggestion": "A bold, authoritative static infographic with a deep teal or navy background. Large headline: 'Studied by Yale & Harvard.' Four stat callouts arranged vertically with large percentage numbers in a warm gold or white accent colour. Clean sans-serif font. Small 'Sudarshan Kriya' label and '70+ peer-reviewed studies' footer. Feels credible, research-grade, and premium — not spiritual or abstract.",
        "image_url": "/demo-assets/post-5.png"
    },
    {
        "id": "demo-hp-post-6",
        "post_order": 6,
        "caption": "500 million people. 182 countries. One breath.\n\nSudarshan Kriya isn't a trend — it's the world's most widely practised breathing technique.\n\n✅ Featured in United Nations programmes\n✅ Adopted by the WHO and World Economic Forum\n✅ Used in military rehabilitation and disaster recovery worldwide\n\nFrom corporate boardrooms to conflict zones — this technique works wherever humans need peace.\n\nDelhi, it's your turn.\n\n🔗 Link in bio to join the next Happiness Program.",
        "hashtags": "#ArtOfLiving #SudarshanKriya #GlobalWellness #UNWellness #500Million #BreatheWithTheWorld #DelhiWellness",
        "post_type": "single_image",
        "scheduled_day": 18,
        "image_suggestion": "A striking, clean world map graphic in soft warm tones on a light background, with gentle radiating dots or highlights across continents suggesting global reach. Large bold text overlay: '500 Million People. 182 Countries.' Below, three small credential badges for UN, WHO, WEF styled as subtle trust markers. Feels authoritative and global, not cluttered. Minimal and powerful.",
        "image_url": "/demo-assets/post-6.png"
    },
    {
        "id": "demo-hp-post-7",
        "post_order": 7,
        "caption": "4 days. One decision. A lifetime of calm.\n\n🧘 The Happiness Program — Delhi\n\n📅 Starting May 6\n👩‍🏫 Led by Rajni Chowdhary\n📍 New Delhi\n\nWhat you'll learn:\n✨ Sudarshan Kriya — the breathing technique practised by 500M+ people\n✨ Pranayama, yoga & guided meditation\n✨ Practical tools for stress, sleep & emotional resilience\n\nNo experience needed. No flexibility required. Just show up and breathe.\n\n🔗 Register now — link in bio\nwww.registrationlink.com",
        "hashtags": "#HappinessProgram #ArtOfLivingDelhi #SudarshanKriya #MeditationWorkshop #DelhiEvents #StressRelief #BreathworkDelhi",
        "post_type": "single_image",
        "scheduled_day": 21,
        "image_suggestion": "A warm, inviting programme details card with a soft sunrise gradient background (peach to warm gold). Clean, modern layout with the programme name prominent at top, followed by date, location, and key inclusions in an elegant list format. A small lotus or breath-wave motif at the bottom. Registration URL clearly visible. Feels like a premium event invitation — approachable yet polished.",
        "image_url": "/demo-assets/post-7.png"
    },
    {
        "id": "demo-hp-post-8",
        "post_order": 8,
        "caption": "Before: 3am anxiety spirals. Staring at the ceiling. Dreading tomorrow before it starts.\n\nAfter: Sleeping through the night. Waking up before the alarm — actually wanting to.\n\nThe only thing that changed? How I breathe.\n\nSudarshan Kriya gave me back my sleep — and with it, my energy, my patience, my life.\n\nResearch shows it delivers 3x more time in deep, restorative sleep.\n\nThe Happiness Program teaches you this in just 4 days. Delhi, May 6.\n\n🔗 Link in bio",
        "hashtags": "#SleepBetter #AnxietyRelief #SudarshanKriya #HappinessProgram #DelhiWellness #BreathingTechnique #RestoreYourSleep",
        "post_type": "single_image",
        "scheduled_day": 25,
        "image_suggestion": "A split-composition image: left side shows a dark, restless scene — crumpled sheets, a glowing phone showing 3:07am, blue-toned and anxious. Right side shows a peaceful morning scene — soft golden light through curtains, a neatly made bed, a cup of tea by a window. No faces visible in either half. A thin vertical dividing line with the word 'Breathe' in elegant script. Powerful contrast, emotional and immediate.",
        "image_url": "/demo-assets/post-8.png"
    },
    {
        "id": "demo-hp-post-9",
        "post_order": 9,
        "caption": "This isn't wellness hype. It's peer-reviewed science.\n\n70+ independent studies. 4 continents. Published in journals you can verify yourself.\n\nResearchers at Yale found Sudarshan Kriya outperformed other wellbeing interventions for stress and emotional resilience.\n\nHarvard-affiliated studies confirmed significant improvements in anxiety, depression, and sleep quality.\n\nWhen the world's top institutions study a breathing technique for decades — and keep publishing — it means something.\n\nLearn it in 4 days. Delhi, May 6.\n\n🔗 Link in bio",
        "hashtags": "#ResearchBacked #YaleStudy #HarvardResearch #SudarshanKriya #ScienceOfBreathing #ArtOfLiving #DelhiWellness #EvidenceBased",
        "post_type": "single_image",
        "scheduled_day": 28,
        "image_suggestion": "A sophisticated research-highlight card on a clean white background. A large '70+' in bold serif typography dominates the top half, with 'Peer-Reviewed Studies' beneath it. Below, a minimal horizontal timeline showing research milestones across 4 continents with small institution name references (Yale, Harvard). Colour palette: deep navy, white, and a single warm gold accent. Academic and trustworthy in feel.",
        "image_url": "/demo-assets/post-9.png"
    },
    {
        "id": "demo-hp-post-10",
        "post_order": 10,
        "caption": "Meet your guide to rediscovering calm.\n\nRajni Chowdhary is a certified Art of Living instructor who has guided hundreds of people — from stressed professionals to anxious students — through the Happiness Program.\n\nShe doesn't lecture. She walks beside you. Step by step. Breath by breath.\n\nNo experience needed. No judgement. Just gentle, expert guidance through 4 transformative days.\n\n📅 May 6 | 📍 New Delhi\n\nYour calm is waiting.\n\n🔗 Register: link in bio",
        "hashtags": "#HappinessProgram #ArtOfLivingDelhi #MeditationTeacher #WellnessWorkshop #DelhiEvents #GuidedMeditation #LearnToBreath",
        "post_type": "single_image",
        "scheduled_day": 31,
        "image_suggestion": "A warm, soft-focus photograph of a serene meditation or workshop setting — a small group of anonymous participants sitting peacefully in a light-filled room with plants and natural textures. An instructor figure is seen from behind or from the side (no identifiable face), gesturing gently. Warm golden light. Feels intimate, safe, and inviting. No text overlay needed — the scene speaks.",
        "image_url": "/demo-assets/post-10.png"
    },
    {
        "id": "demo-hp-post-11",
        "post_order": 11,
        "caption": "Here's everything you learn in just 4 days:\n\n🌬️ Sudarshan Kriya — the flagship breathing technique that reduces cortisol by up to 87.5%\n🫁 Pranayama — yogic breathwork to calm your nervous system\n🧘 Yoga — gentle movement for physical tension release\n🧠 Guided Meditation — access stillness and clarity\n💡 Life Tools — practical wisdom for emotions, relationships, and challenges\n\nPlus: lifetime access to free weekly practice groups in 182+ countries.\n\nThis isn't a one-time event. It's a lifelong practice.\n\n🔗 Link in bio",
        "hashtags": "#HappinessProgram #SudarshanKriya #Pranayama #YogaAndMeditation #ArtOfLiving #DelhiWorkshop #WellnessForLife #BreathworkBenefits",
        "post_type": "single_image",
        "scheduled_day": 34,
        "image_suggestion": "A clean, modern carousel-style single image with 5 horizontal sections stacked vertically, each with a distinct soft colour block (sage green, sky blue, warm peach, lavender, golden yellow) and one-line text describing each programme component. Small elegant line illustrations beside each — a breath wave, lungs, a yoga pose silhouette, a meditation circle, a lightbulb. Cohesive, colourful but not overwhelming. Feels like a premium programme brochure.",
        "image_url": "/demo-assets/post-11.png"
    },
    {
        "id": "demo-hp-post-12",
        "post_order": 12,
        "caption": "182 countries. 500 million+ practitioners. One breathing technique connecting them all.\n\nFrom New York to New Delhi. From Tokyo to Toronto.\n\nSudarshan Kriya is the world's largest breathing community — and every participant gets lifetime access to free weekly practice groups, anywhere in the world.\n\nYou learn once. You practise for life. Wherever you go.\n\nDelhi's next batch starts May 6.\n\nJoin the circle.\n\n🔗 Register: link in bio\nwww.registrationlink.com",
        "hashtags": "#GlobalCommunity #SudarshanKriya #182Countries #ArtOfLiving #BreatheWithTheWorld #DelhiWellness #LifetimeAccess #WellnessCommunity",
        "post_type": "single_image",
        "scheduled_day": 37,
        "image_suggestion": "A beautiful, warm-toned graphic showing a stylised globe at centre with soft, glowing connection lines radiating outward to different continents. The number '500M+' appears large and prominent. Small text: '182 countries. Lifetime free practice groups.' Colour palette: warm gold, soft terracotta, cream. Feels expansive, connected, and hopeful — not corporate. Clean single focal point.",
        "image_url": "/demo-assets/post-12.png"
    },
    {
        "id": "demo-hp-post-13",
        "post_order": 13,
        "caption": "Delhi — 5 days to go. ⏳\n\nIn less than a week, the Happiness Program begins.\n\n4 days to learn a breathing technique practised by 500 million people.\n4 days to finally address the stress you've been carrying.\n4 days to change how you sleep, feel, and show up.\n\nLed by Rajni Chowdhary. No experience needed. Just show up and breathe.\n\n📅 May 6 | 📍 New Delhi\n\nSeats are limited. Don't overthink this one.\n\n🔗 Register now — link in bio",
        "hashtags": "#CountdownToCalm #HappinessProgram #DelhiEvents #May2026 #ArtOfLiving #RegisterNow #BreatheIntoYourBestSelf",
        "post_type": "single_image",
        "scheduled_day": 40,
        "image_suggestion": "A bold countdown graphic with a large, warm-toned '5 DAYS' as the dominant visual element in elegant serif typography against a soft sunrise gradient (peach to gold). Below in smaller clean text: 'Happiness Program. May 6. Delhi.' Subtle breath-wave motif at the bottom. Feels urgent but warm — not aggressive. Premium, minimal, and action-driving.",
        "image_url": "/demo-assets/post-13.png"
    },
    {
        "id": "demo-hp-post-14",
        "post_order": 14,
        "caption": "Tomorrow changes everything.\n\nThe Happiness Program starts May 6 in Delhi.\n\n4 days of Sudarshan Kriya, pranayama, yoga, meditation & life tools — led by Rajni Chowdhary.\n\n✅ Backed by 70+ peer-reviewed studies\n✅ No experience needed\n✅ Lifetime access to free weekly practice groups worldwide\n\nYou don't need to fix your whole life. You just need to learn how to breathe.\n\nThis is your moment, Delhi.\n\n🔗 Register now: www.registrationlink.com",
        "hashtags": "#HappinessProgram #ArtOfLivingDelhi #SudarshanKriya #RegisterNow #May6Delhi #BreatheIntoYourBestSelf #TransformYourLife #LastChance",
        "post_type": "single_image",
        "scheduled_day": 43,
        "image_suggestion": "A powerful, clean final CTA image: warm sunrise colours (deep gold, soft coral) filling the frame. Large bold white text: 'Tomorrow Changes Everything.' Below in slightly smaller text: 'Happiness Program | May 6 | Delhi.' Registration URL at the bottom. No clutter, no extra elements — just warmth, clarity, and conviction. Feels like the sun rising on a new chapter.",
        "image_url": "/demo-assets/post-14.png"
    }
],

    // Video
    video_url: "/demo-assets/campaign-video.mp4",
    video_status: "completed",
    video_script: "Create a 70-second vertical (9:16) video with a professional Indian female avatar, age 32-35, wearing a smart casual kurta top in earthy tones, hair neatly styled, warm smile, confident posture, speaking in clear English with a natural Indian accent. Background: A modern home studio setup with a wooden desk, a small indoor plant (money plant or peace lily), soft warm-toned LED lighting, a bookshelf slightly blurred in the background, and a subtle Art of Living-inspired pastel color palette in the environment.\n\nTONE: Warm, encouraging, and knowledgeable — like a trusted marketing friend sitting across from you over chai, genuinely excited about the strategy she's built specifically for you.\n\n---\n\nSCRIPT:\n\n[SCENE 1 - Opening & Personal Greeting (0-12 seconds)]\nAvatar speaks with a warm smile and gentle hand-wave:\n\"Namaste Satbir! I've spent time studying your Happiness Program by Art of Living, understanding your audience — those hardworking Delhi professionals who've been running on stress like it's their morning chai — and I've put together a complete 4-week campaign strategy just for you. Let me walk you through it.\"\n[Visual: Text overlay fades in at top — \"Your Personalized Campaign Strategy\" in elegant serif font. Lower third displays: \"Satbir × MiCA | Happiness Program Launch Plan\"]\n\n[SCENE 2 - The Problem We're Solving (12-28 seconds)]\nAvatar speaks with a slightly serious, empathetic expression, leaning in slightly:\n\"Here's what we know — your ideal audience has normalised stress. They think burnout is just part of the hustle. The real cost? Health, relationships, mental clarity. So Week 1 we hold up that mirror — name the problem. Week 2, we agitate — show them what they're actually losing by ignoring it.\"\n[Visual: Animated text cards — Week 1: \"Name the Problem 🪞\" and Week 2: \"Show the Real Cost 💔\" with subtle fade-in transitions.]\n\n[SCENE 3 - The Strategy & Channels (28-52 seconds)]\nAvatar gestures with open hands, tone shifts to energized and confident:\n\"Week 3 — we introduce the solution. SKY Breath Meditation, backed by over 100 peer-reviewed studies. And we deliver it across three channels working together: Instagram Reels and carousels that stop the scroll, an email nurture sequence that builds trust, and WhatsApp direct outreach that feels like a friend recommending something life-changing. Then Week 4 — social proof with 500 million-plus participants worldwide, urgency around the 4-day workshop in New Delhi on 6th May 2026 led by Rajni Chowdhary, and a dead-simple sign-up process.\"\n[Visual: Split screen — avatar on the left, animated channel icons on the right appearing one by one: Instagram, Email, WhatsApp. Then a Week 3-4 timeline graphic with \"500M+ participants\" badge and \"6 May 2026\" calendar pin.]\n\n[SCENE 4 - Motivating Close (52-70 seconds)]\nAvatar speaks with a genuine, uplifting smile, hands together in a slight namaste gesture at the end:\n\"Satbir, you're not just selling a workshop — you're offering people a doorway back to themselves. The strategy is ready. The channels are mapped. Let's hit launch and start changing lives in Delhi. I'll see you on the other side — let's go!\"\n[Visual: Text overlay — \"Ready to Launch? 🚀\" with subtle confetti animation. Final frame: \"Happiness Program | New Delhi | 6th May 2026\" and \"Strategy by MiCA\" in clean centered typography.]\n\n---\n\nVISUAL NOTES FOR VIDEO AGENT:\n- Avatar should maintain natural eye contact throughout, with subtle head movements and hand gestures that increase in energy from Scene 1 to Scene 4.\n- Text overlays: clean modern sans-serif (Poppins or Montserrat) for data points, warm serif (Playfair Display) for emotional headlines. All text large enough for mobile readability.\n- Transitions: smooth crossfades or gentle slide-ins between scenes — no harsh cuts.\n- Background music: Soft uplifting lo-fi or acoustic instrumental, building subtly toward the closing scene. Volume low enough to never compete with the avatar's voice.\n- Color scheme: Warm ivory (#FFFFF0) and soft gold (#D4A574) as primary tones, saffron-orange (#FF9933) accents for highlights, charcoal (#333333) for text.\n- All on-screen text appears for minimum 3 seconds for comfortable mobile reading.\n- Final frame holds 3-4 seconds with no avatar speaking.",

    // Execution Schedule
    execution_schedule: [
    {
        "id": "sched-1",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-1",
        "scheduled_day": 1,
        "scheduled_date": "2026-03-24",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-2",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-2",
        "scheduled_day": 5,
        "scheduled_date": "2026-03-28",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-3",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-3",
        "scheduled_day": 10,
        "scheduled_date": "2026-04-02",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-4",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-4",
        "scheduled_day": 15,
        "scheduled_date": "2026-04-07",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-5",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-5",
        "scheduled_day": 19,
        "scheduled_date": "2026-04-11",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-6",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-6",
        "scheduled_day": 23,
        "scheduled_date": "2026-04-15",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-7",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-7",
        "scheduled_day": 27,
        "scheduled_date": "2026-04-19",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-8",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-8",
        "scheduled_day": 31,
        "scheduled_date": "2026-04-23",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-9",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-9",
        "scheduled_day": 36,
        "scheduled_date": "2026-04-28",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-10",
        "channel": "email",
        "asset_type": "email_template",
        "asset_id": "demo-hp-email-10",
        "scheduled_day": 40,
        "scheduled_date": "2026-05-02",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-11",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-1",
        "scheduled_day": 1,
        "scheduled_date": "2026-03-24",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-12",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-2",
        "scheduled_day": 4,
        "scheduled_date": "2026-03-27",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-13",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-3",
        "scheduled_day": 8,
        "scheduled_date": "2026-03-31",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-14",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-4",
        "scheduled_day": 12,
        "scheduled_date": "2026-04-04",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-15",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-5",
        "scheduled_day": 16,
        "scheduled_date": "2026-04-08",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-16",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-6",
        "scheduled_day": 19,
        "scheduled_date": "2026-04-11",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-17",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-7",
        "scheduled_day": 22,
        "scheduled_date": "2026-04-14",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-18",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-8",
        "scheduled_day": 25,
        "scheduled_date": "2026-04-17",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-19",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-9",
        "scheduled_day": 28,
        "scheduled_date": "2026-04-20",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-20",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-10",
        "scheduled_day": 31,
        "scheduled_date": "2026-04-23",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-21",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-11",
        "scheduled_day": 34,
        "scheduled_date": "2026-04-26",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-22",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-12",
        "scheduled_day": 37,
        "scheduled_date": "2026-04-29",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-23",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-13",
        "scheduled_day": 40,
        "scheduled_date": "2026-05-02",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-24",
        "channel": "whatsapp",
        "asset_type": "whatsapp_message",
        "asset_id": "demo-hp-wa-14",
        "scheduled_day": 43,
        "scheduled_date": "2026-05-05",
        "status": "scheduled",
        "recipients_total": 1250,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-25",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-1",
        "scheduled_day": 1,
        "scheduled_date": "2026-03-24",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-26",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-2",
        "scheduled_day": 4,
        "scheduled_date": "2026-03-27",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-27",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-3",
        "scheduled_day": 8,
        "scheduled_date": "2026-03-31",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-28",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-4",
        "scheduled_day": 12,
        "scheduled_date": "2026-04-04",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-29",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-5",
        "scheduled_day": 15,
        "scheduled_date": "2026-04-07",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-30",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-6",
        "scheduled_day": 18,
        "scheduled_date": "2026-04-10",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-31",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-7",
        "scheduled_day": 21,
        "scheduled_date": "2026-04-13",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-32",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-8",
        "scheduled_day": 25,
        "scheduled_date": "2026-04-17",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-33",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-9",
        "scheduled_day": 28,
        "scheduled_date": "2026-04-20",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-34",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-10",
        "scheduled_day": 31,
        "scheduled_date": "2026-04-23",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-35",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-11",
        "scheduled_day": 34,
        "scheduled_date": "2026-04-26",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-36",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-12",
        "scheduled_day": 37,
        "scheduled_date": "2026-04-29",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-37",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-13",
        "scheduled_day": 40,
        "scheduled_date": "2026-05-02",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    },
    {
        "id": "sched-38",
        "channel": "instagram",
        "asset_type": "social_post",
        "asset_id": "demo-hp-post-14",
        "scheduled_day": 43,
        "scheduled_date": "2026-05-05",
        "status": "scheduled",
        "recipients_total": 1,
        "recipients_sent": 0,
        "recipients_failed": 0
    }
],

    // Campaign Logs
    campaign_logs: [
        { channel: "email", action: "sent", recipient: "demo.user@example.com", status_details: "Delivered", executed_at: "2026-03-24T09:00:01Z" },
        { channel: "whatsapp", action: "sent", recipient: "+91-98765-43210", status_details: "Delivered", executed_at: "2026-03-24T09:01:01Z" }
    ]
};

export const DEMO_TONE_VARIANTS: any = {
    "Professional": {
        tone_summary: "A credible, authority-driven approach that positions the Happiness Program as a tool for cognitive optimization and emotional intelligence in leadership. We focus on the science, productivity, and evidence-based results. The language is direct and respectful.",
        sample_email: {
            subject: "Strategies for sustainable high performance",
            opening_paragraph: "Dear {{first_name}}, In today's competitive landscape, cognitive agility and emotional regulation are as crucial as technical skills. Yet, most professionals are operating with high cortisol and mental fatigue. The Happiness Program offers a scientifically validated approach to stress regulation."
        },
        sample_social_post: {
            caption: "Reviewing the data on workplace efficiency? 📊\n\nResearch-backed techniques to reduce cortisol and improve focus.\n\nLink in bio.\n\n#ProfessionalDevelopment #Leadership #Focus #Productivity",
            post_type: "single_image"
        },
        sample_whatsapp: {
            message: "Hello. We are hosting the 3-day Happiness Program designed to enhance professional focus and reduce workplace stress via evidence-based techniques. Would you be interested in reviewing the curriculum? Reply YES for the executive summary."
        },
        recommended_channels: ["email", "linkedin", "whatsapp"],
        channel_reasoning: "Professional tone warrants a shift towards LinkedIn and formal Email."
    },
    "Urgent": {
        tone_summary: "A high-energy, scarcity-driven approach emphasizing the physical and mental cost of constant stress. We use short sentences, time-sensitive triggers, and 'stop scrolling' language.",
        sample_email: {
            subject: "LAST CHANCE: Registration closes in 3 hours",
            opening_paragraph: "This is it. You have 3 hours left. Do not let another month go by exhausted and reactive. Only a few spots remain. If you want to change your state of mind, you need to decide NOW."
        },
        sample_social_post: {
            caption: "STOP SCROLLING. 🛑\n\nDoors to the Happiness Program close tonight.\n\nLINK IN BIO. GO. 🏃\n\n#LastChance #NowOrNever #Urgent",
            post_type: "reel_script"
        },
        sample_whatsapp: {
            message: "Quick update: Only a few spots left for this weekend! 🚨 Enrollment closes tonight. If you were waiting for a sign to prioritize your mental health, this is it. Grab your spot: [Link]"
        },
        recommended_channels: ["whatsapp", "instagram", "sms"],
        channel_reasoning: "Urgency works best on instant channels like WhatsApp and Instagram Stories."
    },
    "Casual": {
        tone_summary: "A relaxed, peer-to-peer vibe that feels like a chat with a best friend. We use emojis, lower-case styling, and humor to make breathwork feel accessible and entirely normal.",
        sample_email: {
            subject: "stressed? same lol. let's fix it.",
            opening_paragraph: "hey friend! 👋 okay, be honest. how many times did you lose your patience today? no judgment. but if you're tired of running on fumes, you gotta check out the Happiness Program."
        },
        sample_social_post: {
            caption: "me trying to meditate: 🧘‍♀️\nmy brain: what if ducks had arms?\n\nthe Happiness Program does the work for you. come hang! link in bio ✨\n\n#relatable #wellness #vibes",
            post_type: "meme"
        },
        sample_whatsapp: {
            message: "heyyy! 👋 doing the Happiness Program this weekend. it's basically a 3-day deep reset for your brain. wanna join? lmk if you want the deets? ✨"
        },
        recommended_channels: ["instagram", "whatsapp", "tiktok"],
        channel_reasoning: "Casual tone lives on social. Instagram/TikTok are primary."
    },
    "Warm & Inspirational": DEMO_CAMPAIGN.tone_preview_content,
    "Custom": {
        tone_summary: "A tailored approach blending the core message with specific requested nuances, ensuring a unique, resonant voice.",
        sample_email: {
            subject: "A gentle invitation to inner peace ✨",
            opening_paragraph: "Greetings. In the quiet moments of the morning, there is a space waiting for you. The Happiness Program is an invitation to inhabit that space. To breathe. To return to your true nature."
        },
        sample_social_post: {
            caption: "Breathe in. 🌿\n\nBreathe out.\n\nYour peace is your highest priority.\n\nLink in bio.\n\n#Peace #Serenity #Breathe",
            post_type: "single_image"
        },
        sample_whatsapp: {
            message: "Hi there. 🌿 Just a gentle reminder that you deserve a moment of profound peace today. Our Happiness Program starts soon. Would you like to join us on this inward journey? Reply YES to begin."
        },
        recommended_channels: ["email", "instagram"],
        channel_reasoning: "Custom tone implies a specific niche approach. Defaulting to high-visual and high-narrative channels."
    }
};
