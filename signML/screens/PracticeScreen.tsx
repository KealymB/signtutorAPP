import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Camera } from "expo-camera";
import { MotiView, AnimatePresence } from "moti";

import colors from "../utils/theme";
import API from "../utils/API";

interface getStateInterface {
  selectedLetters: string[];
  selectedIndecies: number[];
}

type LetterInterface = {
  letter: string;
  state: number;
};

const PracticeScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | undefined>();
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [promptState, setPromptState] = useState<getStateInterface>();
  const [loading, setLoading] = useState(true);
  const cameraRef = useRef(null);

  const requestPerm = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const fetchPrompt = async () => {
    return fetch(API + "getState")
      .then((response) => response.json())
      .then((json) => {
        setPromptState(json);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const makeGuess = async () => {
    setLoading(true);
    if (cameraRef?.current != null) {
      let pic = await cameraRef?.current.takePictureAsync({
        base64: true,
        quality: 0.2,
      });
      const body = new FormData();
      body.append("base64Image", pic.base64);
      fetch(API + "makeGuess", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: body,
      })
        .then((response) => response.json())
        .then((json) => {
          setPromptState(json);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    requestPerm();
    fetchPrompt();
  }, []);

  const Letter = ({ letter, state }: LetterInterface) => {
    if (state == 0) {
      //if the letter has been guessed correctly
      return (
        <Text key={letter} style={[styles.baseLetter, styles.falseLetter]}>
          {letter}
        </Text>
      );
    }
    if (state == 2) {
      //if the letter has been guessed correctly
      return (
        <View style={{ borderBottomWidth: 3, borderColor: "white" }}>
          <Text key={letter} style={[styles.baseLetter, styles.pendingLetter]}>
            {letter}
          </Text>
        </View>
      );
    }
    return (
      <Text key={letter} style={[styles.baseLetter, styles.trueLetter]}>
        {letter}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {hasPermission ? (
        <Camera style={styles.cameraView} type={type} ref={cameraRef}></Camera>
      ) : (
        <TouchableOpacity style={styles.cameraView}>
          <Text>Camera does not have permission, press to open prompt.</Text>
        </TouchableOpacity>
      )}
      <View style={styles.promptContainer}>
        <Text style={{ fontSize: 25, color: "white" }}>PROMPT</Text>
        <View style={styles.letterContainer}>
          {promptState ? (
            promptState.selectedLetters.map((letter, index) => {
              return (
                <Letter
                  key={letter}
                  letter={letter}
                  state={promptState.selectedIndecies[index]}
                />
              );
            })
          ) : (
            <ActivityIndicator size="large" />
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.btn} onPress={() => makeGuess()}>
        {!loading ? (
          <Text style={styles.btnText}>Submit</Text>
        ) : (
          <ActivityIndicator size="large" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PracticeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.tertiary,
    padding: 8,
    alignItems: "center",
  },
  cameraView: {
    marginTop: 20,
    height: 250,
    width: 250,
    borderRadius: 20,
    overflow: "hidden",
  },
  promptContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    marginTop: 50,
    alignItems: "center",
    padding: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,

    elevation: 9,
  },
  letterContainer: {
    margin: 25,
    flexDirection: "row",
  },
  baseLetter: {
    fontSize: 80,
  },
  pendingLetter: {
    color: "white",
  },
  falseLetter: {
    color: "red",
    fontWeight: "bold",
  },
  trueLetter: {
    color: "green",
    fontWeight: "bold",
  },

  btn: {
    position: "absolute",
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 10,
    margin: 10,
    bottom: 20,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,

    elevation: 9,
  },
  btnText: {
    fontSize: 28,
    color: "white",
  },
});
