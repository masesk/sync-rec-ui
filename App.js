import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import {
  StyleSheet, Text, View, Image,
  TextInput, TouchableHighlight, TouchableOpacity
} from 'react-native';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [url, setUrl] = React.useState('http://192.168.1.17');
  const [port, setPort] = React.useState('8080');
  const [errors, setErrors] = React.useState('');
  const [valid, setValid] = React.useState(false);
  const [picTaken, setPicTaken] = React.useState(false);
  const [picData, setPicData] = React.useState("")
  let camera = React.useRef();
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    camera.getAvailablePictureSizesAsync().then(data=>{
      console.log(data)
    })
  }, []);
  const connect = () => {
    fetch(url + ":" + port + "/checkstatus")
      .then(response => response.json())
      .then(data => {
        if (data["up"] === 200) {
          setValid(true)
        }
        else {
          setErrors("Network Error: server unreachable or invalid ip address/port")
        }
      })
      .catch(error =>
        setErrors("Network Error: server unreachable or invalid ip address/port")
      );
  }

  const sendPhoto = (data) => {
    fetch(url + ":" + port,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "data": data
        })
      })
      .then(res => res.json())
      .then(obj => {
        setPicData("data:image/png;base64," + obj["data"])
        console.log(obj["data"])
      })
      .catch((error) => {
        //Do some stuff.
      })
  }

  const snap = async () => {
    if (camera) {
      let photo = await camera.takePictureAsync({ base64: true }).then(photo => {
        setPicTaken(true)
        sendPhoto(photo.base64);
        //camera.pausePreview();
        
      })
    }
  };

  return (

    <>
      {(hasPermission !== null && hasPermission !== false && valid !== true) ?
        <View style={styles.container}>
          <Text>Please enter server information</Text>
          <StatusBar style="auto" />
          <View style={styles.boxcontainer}>
            <Text>IP: </Text>
            <TextInput
              style={styles.urlbox}
              onChangeText={text => setUrl(text)}
              value={url}
            />
            <Text>   PORT: </Text>
            <TextInput
              style={styles.portbox}
              onChangeText={text => setPort(text)}
              value={port}
            />
          </View>
          <View>
            <TouchableHighlight
              style={{ ...styles.openButton, width: 100 }}
              onPress={() => {
                connect()
              }}
            >
              <Text style={styles.textStyle}>Connect</Text>
            </TouchableHighlight>
          </View>
          <Text style={{ color: "red" }}>{errors}</Text>
        </View>
        :
        <View style={{ flex: 1 }}>
            
            <Camera ref={ref => {
              camera = ref;
            }} style={{ flex: 1 }} type={type}>
               { (picTaken) && <View style={{ width: "100%", height: "100%", backgroundColor: "gray"}}>
               <TouchableOpacity
                  style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setPicData("")
                    setPicTaken(false)
                  }}>
                
               <Image style={{width: "100%", height: "100%", resizeMode: "contain"}} source={{uri: picData}}/>
               </TouchableOpacity>
                 </View>}
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                }}
                onClick={() => { snap() }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    // setType(
                    //   type === Camera.Constants.Type.back
                    //     ? Camera.Constants.Type.front
                    //     : Camera.Constants.Type.back
                    // );
                    snap();
                  }}>
                </TouchableOpacity>
              </View>
            </Camera>
          
        </View>
      }
    </>

  );
}

const styles = StyleSheet.create({
  openButton: {
    textAlign: "center",
    color: "white",
    backgroundColor: "#209140",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15
  },
  boxcontainer: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: "center"
  },
  urlbox: {
    borderRadius: 10,
    padding: 10,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: "50%"
  },
  portbox: {
    borderRadius: 10,
    padding: 10,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: "15%"
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
