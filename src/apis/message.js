const message = {
  getMessage: (language, type) => {
    return lang[language][type];
  },
};

const lang = {
  kr: {
    initial: "블럭을 설치 해주십시오.",
    phase_2: "전투까지 2턴 남았습니다.",
    phase_3: "전투까지 1턴 남았습니다.",
    start_battle: "전투를 시작합니다.",
  },
};

export default message;
