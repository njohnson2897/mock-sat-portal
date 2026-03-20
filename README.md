# Mock SAT Portal

## Live Demo

[add URL once deployed]

## Overview

This is a full-stack mock SAT portal built for a student actively preparing for the SAT.

I treated it as a focused prep product rather than a full SAT clone. My goal was to make the experience feel realistic during the test itself, but more useful than an actual exam once the student finishes. With this in mind, I prioritized things like section-based timing, flexible practice modes, efficient navigation, immediate and actionable results, answer review, and a lightweight attempt history.

## Tech Stack

The front end is built with React and Vite.  I used Tailwind for the styling.  The backend is a small Express app running on Node and completed attempts are stored in PostgreSQL.

## Product and Architecture Decisions

### Focused scope over full SAT replication

The prompt emphasized student experience over perfect SAT replication, so I intentionally built a narrow but complete slice instead of trying to simulate every SAT rule.

### Timed, unpausable sections

Once a section starts, its timer runs continuously. I chose this to preserve the pacing pressure of a real test (even though my version only has 6 questions per section) and make the assessment flow feel more credible.

### Flexible practice modes

Students can take a full practice test or work on a single section. I added this because prep tools are often used both for full simulations and for targeted practice on weaker areas.

### Free navigation within a section

Students can move through questions with Previous / Next, but they can also jump directly using the Question Overview. I wanted navigation to support test-taking strategy instead of forcing a purely linear flow.

### Review as a study tool

I wanted the post-test experience to be more than just a score screen. Results are broken down by section and skill, and the review screen shows selected answers, correct answers, and explanations so the student can actually learn from the attempt.

### Lightweight persistence

I used Postgres to store completed attempts, section-level results, and answers. I wanted the database work to support an actual product feature (being able to look back at prior attempts) without making the project feel like it was mostly about database design.

## Tradeoffs

I did not try to implement official SAT score conversion or adaptive testing, since both would have added a lot of complexity without really improving the core experience I wanted to show here. I also left out authentication because it felt like it was outside the scope of the project and would have pulled time away from the actual assessment flow. I kept the question bank small and did not build charts or heavier analytics because I thought it was more important to make one complete end-to-end flow work well than to spread the project across too many features.

## What I’d Improve Next

If I had more time, these are some paths for improvement I would take:

- make the attempt history more clearly trend-oriented over multiple attempts
- improve the stability/responsiveness of the assessment layout across different question lengths
- expand the reading content so more questions are passage-based
- expand the question bank
- reflect SAT rules a little more closely (calculator vs. non-calculator sections, long passage reading sections rather than the simple ones I used in my question bank, more standard number of quetsions per section to add realistic time pressure, etc.)
- implement SAT score conversion so that the scores are more meaningful to the student