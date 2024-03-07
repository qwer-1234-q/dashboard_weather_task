/*
{
  name: 'first question',
  options: [
    { optionid: '1', optionName: 'Apple', optionCorrect: 'true' },
    { optionid: '2', optionName: 'Banana', optionCorrect: 'false' },
    { optionid: '3', optionName: 'Orange', optionCorrect: 'false' },
  ],
  point: 10,
  type: '1',
  url: '',
  videoURL: '',
  timeLimit: 10,
  questionId: 1,
},
*/

/*
 For a given data structure of a question, produce another
 object that doesn't contain any important meta data (e.g. the answer)
 to return to a "player"
*/
export const quizQuestionPublicReturn = question => {
  return {
    questionid: question.questionid,
    name: question.name,
    type: question.type,
    timeLimit: question.timeLimit,
    url: question.url,
    videoURL: question.videoURL,
    point: question.point,
    options: question.options.map(({optionid, optionName}) => ({optionid, optionName}))
  }
};

/*
 For a given data structure of a question, get the IDs of
 the correct answers (minimum 1).
*/
export const quizQuestionGetCorrectAnswers = question => {
  return question.options.filter(option => option.optionCorrect === 'true').map(option => option.optionid);
};

/*
 For a given data structure of a question, get the IDs of
 all of the answers, correct or incorrect.
*/
export const quizQuestionGetAnswers = question => {
  return question.options.map(option => option.optionid);
};

/*
 For a given data structure of a question, get the duration
 of the question once it starts. (Seconds)
*/
export const quizQuestionGetDuration = question => {
  // return 10;
  return question.timeLimit;
};
