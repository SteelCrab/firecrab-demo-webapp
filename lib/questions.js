// Validation and normalization for question submissions.
// Pure functions so they can be tested without a database.

export const NAME_MAX = 20;
export const QUESTION_MAX = 200;

export function normalizeQuestion(input) {
  const name = String(input?.name ?? '').trim();
  const question = String(input?.question ?? '').trim();
  if (!name) return { error: '이름을 입력하세요.' };
  if (name.length > NAME_MAX) return { error: `이름은 ${NAME_MAX}자 이내로 입력하세요.` };
  if (!question) return { error: '질문을 입력하세요.' };
  if (question.length > QUESTION_MAX) return { error: `질문은 ${QUESTION_MAX}자 이내로 입력하세요.` };
  return { value: { name, question } };
}
