// _ADD
import { kyInstance } from './instance.api';

const BASE_URL = 'activities';

// function getActivitySlug() {
//   let currentUrl = window.parent.location.href;
//   currentUrl = currentUrl.replace(/\/+$/, '');

//   const parts = currentUrl.split('/');

//   const isPreview = currentUrl.includes('/preview');
  
//   const gameSlug = !isPreview ? parts[parts.length - 1] : parts[parts.length - 2];

//   console.log("currentUrl: ", currentUrl);
//   console.log("parts: ", parts);
//   console.log("gameSlug: ", gameSlug);
//   console.log("isPreview: ", isPreview);
//   return { gameSlug, isPreview };
// }

function getActivitySlug() {
  // let currentUrl = window.parent.location.href;
  // currentUrl = currentUrl.replace(/\/+$/, '');

  // const parts = currentUrl.split('/');

  // const isPreview = currentUrl.includes('/preview');
  
  // const gameSlug = !isPreview ? parts[parts.length - 1] : parts[parts.length - 2];

  // console.log("currentUrl: ", currentUrl);
  // console.log("parts: ", parts);
  // console.log("gameSlug: ", gameSlug);
  // console.log("isPreview: ", isPreview);
  const gameSlug = "1-test-puzzle";

  const isPreview = false;
  return { gameSlug, isPreview };
}

export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getActivityBySlugAndCurrentStudentUser() {
  try {

    const {gameSlug, isPreview} = getActivitySlug();

    const url = `${BASE_URL}/${gameSlug}/${isPreview ? 'teachers' : 'students'}`;

    console.log("url: ", url);

    const activity = await kyInstance.get(url).json();

    return { activity, isPreview };
  } catch (error) {
    return null
  }
}

export async function setActivityCategoryCompletionBySlugAndCurrentStudentUser(data, categoryId) {
  try {

    const { gameSlug } = getActivitySlug();
    const url = `${BASE_URL}/${gameSlug}/students/completion/${categoryId}`

    const json = {
      questionAnswers: data,
      timeCompletedSeconds: 0,
    };

    const completion = await kyInstance.post(url, { json }).json();

    return completion;
  } catch (error) {
    return null;
   
  }
}

export async function updateActivityCategoryCompletionBySlugAndCurrentStudentUser(data, categoryId) {
  try {
    const { gameSlug } = getActivitySlug();
    const url = `${BASE_URL}/${gameSlug}/students/completion/${categoryId}`

    const json = {
      questionAnswers: data,
      timeCompletedSeconds: 0,
    };

    const completion = await kyInstance.patch(url, { json }).json();

    return completion;
  } catch (error) {
    return null;
  }
}

// questionAnswers: {
//   questionId: number;
//   selectedQuestionChoiceId: number;
// }[];
// timeCompletedSeconds: number;

// score: number;
// timeCompletedSeconds: number;
// submittedAt: Date;
// activityCategoryId: number;
// questionAnswers: {
//   completionId: number;
//   questionId: number;
//   selectedQuestionChoiceId: number;
// }[];


// const tempSlug = '12-carrace'
// const activity = await kyInstance.get(`${BASE_URL}/${tempSlug}/students`).json();