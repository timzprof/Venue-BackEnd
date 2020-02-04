/**
 * Shuffle Function
 * @param  {String} string - String to be Shuffled
 * @returns {String} ShuffledString
 */
const shuffle = string => {
  const a = string.split('');
  const n = a.length;

  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a.join('');
};

/**
 * Randomize Function
 * @param  {Number} noOfCharacters - No of Characters for the Random string
 * @returns {String} Randomstring
 */
export const randomize = noOfCharacters => {
  const letters = 'abcdefghijklmnopqrstuvwxyz1234567890';
  const number = noOfCharacters || 8;
  const characters = shuffle(letters);
  const random = characters.substring(0, number);

  return random;
};

export const convertTime = (timeString) => {
  const time = timeString.slice(0, -2);
  const meridiem = timeString.slice(-2);
  let result = Number(time);
  if(meridiem === 'pm') {
      result += 12;
  }
  return result;
}

export class APIError extends Error {
  constructor(message, statusCode){
    super(message);
    this.statusCode = statusCode;
  }
}
