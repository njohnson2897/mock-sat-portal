-- attempts: one completed assessment attempt
CREATE TABLE attempts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  overall_correct INTEGER NOT NULL DEFAULT 0,
  overall_total INTEGER NOT NULL DEFAULT 0
);

-- attempt_section_results: per-section score/time for an attempt
CREATE TABLE attempt_section_results (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  section_key VARCHAR(50) NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0
);

-- attempt_answers: stored submitted answers for review
CREATE TABLE attempt_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  section_key VARCHAR(50) NOT NULL,
  selected_answer CHAR(1),
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);
