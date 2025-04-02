import React, { useReducer, useState, useCallback, memo } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const boardReducer = (state, action) => {
  switch (action.type) {
    case "MOVE":
      const newBoard = [...state];
      newBoard[action.index] = action.symbol;
      return newBoard;
    case "RESET":
      return Array(9).fill(null);
    default:
      return state;
  }
};

const TicTacToe = memo(() => {
  const [board, dispatch] = useReducer(boardReducer, Array(9).fill(null));
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [winner, setWinner] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);

  const checkWinner = useCallback((newBoard) => {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinner(newBoard[a]);
        setHighlightedCells(combo);
        Alert.alert("Game Over", `${newBoard[a]} Wins!`);
        return;
      }
    }
  }, []);

  const botMove = useCallback(async (newBoard) => {
    if (winner) return; // Stop bot move if game is over

    const response = await fetch("https://hiring-react-assignment.vercel.app/api/bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBoard),
    });

    const botIndex = await response.json();
    dispatch({ type: "MOVE", index: botIndex, symbol: playerSymbol === "X" ? "O" : "X" });

    checkWinner(newBoard);
  }, [playerSymbol, checkWinner, winner]);

  const handleClick = useCallback((index) => {
    if (!playerSymbol || board[index] || winner) return;
    dispatch({ type: "MOVE", index, symbol: playerSymbol });

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    checkWinner(newBoard);

    if (!winner) botMove(newBoard);
  }, [board, playerSymbol, winner, botMove, checkWinner]);

  const handleReset = () => {
    dispatch({ type: "RESET" });
    setWinner(null);
    setHighlightedCells([]);
    setPlayerSymbol(null);
  };

  return (
    <View style={styles.container}>
      {!playerSymbol && (
        <View style={styles.symbolSelection}>
          <Pressable style={styles.button} onPress={() => setPlayerSymbol("X")}>
            <Text style={styles.buttonText}>Play as X</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => setPlayerSymbol("O")}>
            <Text style={styles.buttonText}>Play as O</Text>
          </Pressable>
        </View>
      )}
      
      <View style={styles.board}>
        {board.map((cell, index) => (
          <Pressable
            key={index}
            style={[
              styles.cell,
              highlightedCells.includes(index) ? styles.highlighted : null
            ]}
            onPress={() => handleClick(index)}
          >
            <Text style={styles.cellText}>{cell}</Text>
          </Pressable>
        ))}
      </View>

      {winner && <Text style={styles.winnerText}>{winner} Wins!</Text>}

      <Pressable style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Game</Text>
      </Pressable>
    </View>
  );
});

export default function App() {
  return <TicTacToe />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  symbolSelection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  resetButton: {
    backgroundColor: "red",
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 300,
    height: 300,
  },
  cell: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
  },
  cellText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  highlighted: {
    backgroundColor: "#ff0",
  },
  winnerText: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
  },
});
