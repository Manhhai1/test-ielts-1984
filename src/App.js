import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const App = () => {
  const [state, setState] = useState({
    paragraph: '',
    blanks: [],
    dragWords: [],
    answers: [],
    inputDisabled: [],
    feedback: '',
    draggingWord: null,
    correctDropIndex: null,
    wrongDropIndex: null,
    isCorrect: false,
    usedWords: [],
  });

  const loadData = async () => {
    try {
      const res = await fetch('/api/data.json');
      const json = await res.json();
      const { paragraph, blanks, dragWords } = json.question;
      setState({
        ...state,
        paragraph,
        blanks,
        dragWords,
        answers: Array(blanks.length).fill(''),
        inputDisabled: Array(blanks.length).fill(false),
      });
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateState = (newState) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const handleChange = (index, event) => {
    const newAnswers = [...state.answers];
    newAnswers[index] = event.target.value;
    updateState({ answers: newAnswers });
  };

  const handleDrop = (index) => {
    const { draggingWord, dragWords, blanks, usedWords } = state;
    if (draggingWord !== null && dragWords[draggingWord].word === blanks[index].correctAnswer) {
      const newAnswers = [...state.answers];
      newAnswers[index] = dragWords[draggingWord].word;

      updateState({
        answers: newAnswers,
        inputDisabled: state.inputDisabled.map((disabled, i) => (i === index ? true : disabled)),
        correctDropIndex: index,
      });

      setTimeout(() => {
        updateState({
          correctDropIndex: null,
          usedWords: [...usedWords, dragWords[draggingWord].word],
        });
      }, 600);
    } else {
      updateState({ wrongDropIndex: draggingWord });
      setTimeout(() => updateState({ wrongDropIndex: null }), 1000);
    }
    updateState({ draggingWord: null });
  };

  const handleDragStart = (index) => {
    updateState({ draggingWord: index });
  };

  const handleTouchStart = (index) => {
    updateState({ draggingWord: index });
  };

  const handleTouchEnd = (index) => {
    handleDrop(index);
  };

  const handleSubmit = () => {
    const correctAnswers = state.blanks.map(b => b.correctAnswer).join(',');
    const isCorrect = state.answers.join(',') === correctAnswers;
    updateState({
      feedback: isCorrect ? 'Yesss!' : 'Có gì đó sai sai!',
      isCorrect,
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold mb-4">Kéo và thả từ vào đúng chỗ trống</h1>
      <p className="text-lg">
        {state.paragraph.split('[_input]').map((part, index) => (
          <span key={index}>
            <span dangerouslySetInnerHTML={{ __html: part }}></span>
            {index < state.blanks.length && (
              <input
                type="text"
                className={`w-[120px] focus:outline-none border-b-2 border-gray-400 px-2 cursor-pointer transition-colors duration-300 ${
                  state.inputDisabled[index] ? 'bg-gray-200 text-gray-600' : 'hover:bg-gray-200'
                }`}
                value={state.answers[index]}
                onDrop={() => handleDrop(index)}
                onDragOver={(e) => e.preventDefault()}
                disabled={state.inputDisabled[index]}
                onChange={(e) => handleChange(index, e)}
                onTouchEnd={() => handleDrop(index)} // Handle touch end for input
              />
            )}
          </span>
        ))}
      </p>
      <div className="flex space-x-2 mt-4 gap-[10px]">
        {state.dragWords.map((word, index) => {
          if (state.usedWords.includes(word.word)) return null;
          return (
            <motion.div
              key={word.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onTouchStart={() => handleTouchStart(index)} // Handle touch start
              style={{ color: word.color }}
              className={`p-2 rounded cursor-pointer bg-[#FF9D3D]`}
              animate={{
                x: state.wrongDropIndex === index ? [-10, 10, -10, 0] : 0,
                scale: state.correctDropIndex === index ? [0, 5, 0] : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              {word.word}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4">
        <motion.button
          whileTap={{ scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          onClick={handleSubmit}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-400"
        >
          Submit
        </motion.button>
        <motion.p
          className="mt-4 text-[14px] px-4"
          animate={{
            scale: state.feedback ? 1.1 : 1,
            color: state.isCorrect ? '#00FF00' : '#FF0000',
          }}
          transition={{ duration: 0.5 }}
        >
          {state.feedback}
        </motion.p>
      </div>
    </div>
  );
};

export default App;
