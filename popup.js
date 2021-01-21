const startButton = document.querySelector('#pomodoro-start');

const stopButton = document.querySelector('#pomodoro-stop');

const pomodoroTimer = document.querySelector('.pomodoro-timer');

const workDurationInput = document.querySelector('#input-work-duration');

const breakDurationInput = document.querySelector('#input-break-duration');

// Display initial timer state at the start
const progressBar = new ProgressBar.Circle(pomodoroTimer, {
  strokeWidth: 2,
  text: {
    value: '25:00',
  },
  color: '#fcfcfc',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: {
    display: 'block',
    width: '100%'
  },
  style: {
    // Text color.
    // Default: same as stroke color (options.color)
    position: 'center',
    left: '50%',
    top: '50%',
    margin: 'auto'
  }
});

let currentTimeLeftInSession = 1500;

let workSessionDuration = 1500; // = 25 mins

let breakSessionDuration = 300; // = 5 mins

// 自定义工作时间和休息时间
let updatedWorkSessionDuration;

let updatedBreakSessionDuration;

workDurationInput.value = '25';

breakDurationInput.value = '5';

// 定义一个新的函数，做两件事情：1）查看 updatedBreakSessionDuration, 以查看用户是否更新了会话持续时间；
// 2）如果是的话，它将根据用户输入的值设置新的会话持续时间
let type = 'Work';

let timeSpentInCurrentSession = 0;

let isClockRunning = false;

let isClockStopped = true;



const toggleClock = reset => {
  togglePlayPauseIcon(reset);
  if (reset) {
    stopClock();
  } else {
    if (isClockStopped) {
      setUpdatedTimers();
      isClockStopped = false;
    }

    if (isClockRunning === false) {
      clockTimer = setInterval(() => {
        stepDown()
        displayCurrentTimeLeftInSession()
        progressBar.set(calculateSessionProgress())
      }, 1000);
      isClockRunning = true;
    } else {
      clearInterval(clockTimer);
      isClockRunning = false;
    }

    showStopIcon();
  }
};

const calculateSessionProgress = () => {
  // calculate the completion rate of this session
  let sessionDuration =
    type === 'Work' ? workSessionDuration : breakSessionDuration;
  return timeSpentInCurrentSession / sessionDuration;
};

const stopClock = () => {
  setUpdatedTimers();
  clearInterval(clockTimer);
  isClockStopped = true;
  isClockRunning = false;
  currentTimeLeftInSession = workSessionDuration;
  displayCurrentTimeLeftInSession();
  type = 'Work';
  timeSpentInCurrentSession = 0;
}


// 现在我们要格式化时间， 把时间从秒数转换为分和秒
// 先用 % 60 获得秒数，例:  70秒 = 1 分 10 秒
const displayCurrentTimeLeftInSession = () => {
  const secondsLeft = currentTimeLeftInSession;
  let res = '';
  const seconds = secondsLeft % 60;
  const minutes = parseInt(secondsLeft / 60) % 60;
  let hours = parseInt(secondsLeft / 3600);

  // ADD LEADING ZEROS IF IT'S LESS THAN 10
  function addLeadingZeroes(time) {
    if (time < 10) {
      return `0${time}`;
    } else {
      return time;
    }
  }

  if (hours > 0) {
    res += `${hours}:`;
  }
  res += `${addLeadingZeroes(minutes)}:${addLeadingZeroes(seconds)}`;

  progressBar.text.innerText = res.toString();
}


const minutesToSeconds = mins => {
  return mins * 60;
};


const setUpdatedTimers = () => {
  if (type === 'Work') {
    currentTimeLeftInSession = updatedWorkSessionDuration ?
      updatedWorkSessionDuration : workSessionDuration;
    workSessionDuration = currentTimeLeftInSession;
  } else {
    currentTimeLeftInSession = updatedBreakSessionDuration ?
      updatedBreakSessionDuration : breakSessionDuration;
    breakSessionDuration = currentTimeLeftInSession;
  }
};


// 在工作和休息间切换
// 单独写一个函数，将上面在计时器里每秒都持续减少的方法移除
// 在工作和休息之间切换
// 显示已完成/已停止的日志
// 能够编辑任务的标签
const stepDown = () => {
  if (currentTimeLeftInSession > 0) {
    currentTimeLeftInSession--;
    timeSpentInCurrentSession++; // 累计花费的时间持续增加
  } else if (currentTimeLeftInSession === 0) {
    timeSpentInCurrentSession = 0; // 重置累计花费的时间
    if (type === 'Work') {
      currentTimeLeftInSession = breakSessionDuration;
      type = 'Break';
    } else {
      currentTimeLeftInSession = workSessionDuration;
      type = 'Work';
    }
  }
  displayCurrentTimeLeftInSession();
};


// 要设置一个新的函数，让我们在时钟不工作时隐藏暂停图标
// 该参数 reset 是一个 boolean 值，它将确定我们是否要重置时钟，重置时无论时钟暂停与否，我们总是要显示播放钮
// 检察元素里面是否具有 hidden 类别，有的话移除，没有的话加上去
const togglePlayPauseIcon = reset => {
  const playIcon = document.querySelector('#play-icon');
  const pauseIcon = document.querySelector('#pause-icon');

  if (reset) {
    // 重置番茄钟的时候，永远都切换回播放钮
    if (playIcon.classList.contains('hidden')) {
      playIcon.classList.remove('hidden');
    }
    if (!pauseIcon.classList.contains('hidden')) {
      pauseIcon.classList.add('hidden');
    }
  } else {
    playIcon.classList.toggle('hidden');
    pauseIcon.classList.toggle('hidden');
  }
};

const showStopIcon = () => {
  const stopButton = document.querySelector('#pomodoro-stop');
  stopButton.classList.remove('hidden');
};


startButton.addEventListener('click', () => {
  toggleClock();
  displayCurrentTimeLeftInSession();
});

stopButton.addEventListener('click', () => {
  toggleClock(true);
});


workDurationInput.addEventListener('input', () => {
  updatedWorkSessionDuration = minutesToSeconds(workDurationInput.value);
});

breakDurationInput.addEventListener('input', () => {
  updatedBreakSessionDuration = minutesToSeconds(breakDurationInput.value);
});
