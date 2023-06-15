const pieceApi = {
  createNewPiece: function () {
    const min = 2;
    const max = 4;
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    let arr = [null, null, null, null];

    //1. Input Element
    for (let index = 0; index < count; index++) {
      const random = Math.floor(Math.random() * 100) + 1;
      let selected_element = { ...getElement(random) };
      arr[index] = selected_element;
    }

    //2. Shuffle Element
    arr = shuffleArray(arr);

    //3. Array Convert 2 Matrix
    const matrix = [
      [arr[0], arr[1]],
      [arr[2], arr[3]],
    ];

    return matrix;
  },
};

function getElement(random) {
  if (1 <= random && random <= 30) {
    return elements[0];
  } else if (31 <= random && random <= 60) {
    return elements[1];
  } else if (61 <= random && random <= 80) {
    return elements[2];
  } else if (81 <= random && random <= 100) {
    return elements[3];
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const elements = [
  {
    id: 0,
    name: "attack",
    code: "A",
    consider: false, //놓여져 있지만, 결정 대기중인 상태인
    decided: false, //놓여진 상태
  },
  {
    id: 1,
    name: "defend",
    code: "D",
    consider: false, //놓여져 있지만, 결정 대기중인 상태인
    decided: false, //놓여진 상태
  },
  {
    id: 2,
    name: "gold",
    code: "G",
    consider: false, //놓여져 있지만, 결정 대기중인 상태인
    decided: false, //놓여진 상태
  },
  {
    id: 3,
    name: "recover",
    code: "R",
    consider: false, //놓여져 있지만, 결정 대기중인 상태인
    decided: false, //놓여진 상태
  },
];

export default pieceApi;
