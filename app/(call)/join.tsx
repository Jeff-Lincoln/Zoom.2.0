import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { inverseFormatSlug } from '@/lib/slugs';
import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { useRouter } from 'expo-router';
import Toast from 'react-native-root-toast';

const Join = () => {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const client = useStreamVideoClient();
  const router = useRouter();

  const handleJoinRoom = () => {
    if (!roomId) return;

    const slug = inverseFormatSlug(roomId);
    setLoading(true); // Set loading to true before the call

    const call = client?.call("default", slug);

    call?.get()
      .then((callResponse) => {
        console.log(callResponse);
        router.push(`/(call)/${slug}`);
      })
      .catch((reason) => {
        console.error('Failed to join call: ', reason);
        Toast.show(
          "Whoops! \n Looks like the room you're trying to join does not exist.",
          {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
          }
        );
      })
      .finally(() => {
        setLoading(false); // Reset loading state
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the Room Name</Text>

      <TextInput
        placeholder='eg: Black Purple Tiger'
        value={roomId}
        onChangeText={setRoomId}
        style={styles.input}
        placeholderTextColor="#999" // Placeholder color
      />

      <TouchableOpacity
        onPress={handleJoinRoom}
        style={styles.button}
        disabled={loading} // Disable button when loading
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" /> // Loading indicator
        ) : (
          <Text style={styles.buttonText}>Join Room</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default Join;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F0F0', // Light background for contrast
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    padding: 15,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    elevation: 2, // Adds shadow for depth
  },
  button: {
    padding: 15,
    backgroundColor: '#5f5dec',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Elevation for button
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});


// import { StyleSheet, Text, View, TextInput, TouchableOpacityBase } from 'react-native'
// import React, { useState } from 'react'
// import { inverseFormatSlug } from '@/lib/slugs';
// import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
// import { useRouter } from 'expo-router';
// import Toast from 'react-native-root-toast';

// const Join = () => {
//   const [roomId, setRoomId] = useState("");
//   const client = useStreamVideoClient();
//   const router = useRouter();

//   const handleJoinRoom = () => {
//     if(!roomId) return;

//     const slug = inverseFormatSlug(roomId);

//     const call = client?.call("default", slug);

//     call?.get().then((callResponse) => {
//       console.log(callResponse);
//       router.push(`/(call)/${slug}`); 
//     }).catch((reason) => {
//       console.error('Failed to join call: ', reason);

//       Toast.show(
//         "Whoops! \n Looks like the room you're trying to join does not exist.",
//         {
//           duration: Toast.durations.LONG,
//           position: Toast.positions.CENTER,
//           shadow: true,
//           animation: true,
//           hideOnPress: true,
//           delay: 0,
//         }
//       )
//     })
//   }
//   return (
//     <View style={{
//       flex: 1
//     }}>
//       <Text style={{
//         padding: 20,
//         fontWeight: 'bold',
//       }}>Enter the Room Name</Text>

//       <TextInput
//       placeholder='eg: Black Purple Tiger'
//       value={roomId}
//       onChangeText={setRoomId}
//       style={{
//         padding: 20,
//         width: "100%",
//         backgroundColor: "white",
//       }}/>

//       <TouchableOpacityBase
//       onPress={handleJoinRoom}
//       style={{
//         padding: 20,
//         backgroundColor: '#5f5dec',
//         width: "100%",
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}>
//         <Text>Join Room</Text>
//       </TouchableOpacityBase>
//     </View>
//   )
// }

// export default Join

// const styles = StyleSheet.create({})