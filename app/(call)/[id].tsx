import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { useLocalSearchParams } from 'expo-router';
import Room from '@/components/Room';
import { generateSlug } from "random-word-slugs";
import Toast from 'react-native-root-toast';
import { copySlug } from '@/lib/slugs';

const CallScreen = () => {
  const { id } = useLocalSearchParams();
  const [call, setCall] = useState<Call | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Loading state
  const client = useStreamVideoClient();

  useEffect(() => {
    let slug: string;

    if (id !== "call" && id) {
      // Joining an existing call
      slug = id.toString();
      const _call = client?.call("default", slug);
      _call?.join({ create: false })
        .then(() => {
          setCall(_call);
          setLoading(false); // Stop loading after joining
        })
        .catch(() => {
          showToast("Failed to join call. Please try again.");
        });
    } else {
      // Creating a new call
      slug = generateSlug(3, {
        categories: {
          adjective: ["color", "personality"],
          noun: ["food", "science"],
        },
      });
      const _call = client?.call("default", slug);
      _call?.join({ create: true })
        .then(() => {
          showToast("Call Created Successfully. Tap here to copy the call ID!");
          setCall(_call);
          setLoading(false); // Stop loading after creating
        })
        .catch(() => {
          showToast("Failed to create call. Please try again.");
        });
    }

    setSlug(slug);
  }, [id, client]);

  useEffect(() => {
    return () => {
      // Clean up: Leave the call when the component unmounts
      if (call?.state.callingState !== CallingState.LEFT) {
        call?.leave();
      }
    };
  }, [call]);

  const showToast = (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.CENTER,
      shadow: true,
      onPress: async () => {
        if (slug) copySlug(slug);
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Joining the call...</Text>
      </View>
    );
  }

  if (!call || !slug) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to connect to the call. Please try again.</Text>
      </View>
    );
  }

  return (
    <StreamCall call={call}>
      <Room slug={slug} />
    </StreamCall>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cf1010',
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cf1010',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});


// import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk'
// import { useLocalSearchParams } from 'expo-router'
// import Room from '@/components/Room';
// import { generateSlug } from "random-word-slugs";
// import Toast from 'react-native-root-toast';
// import { copySlug } from '@/lib/slugs';



// const CallScreen = () => {
//   const { id } = useLocalSearchParams();
//   const [call, setCall] = useState<Call | null>(null);
//   const [slug, setSlug] = useState<string | null>(null);
//   const client = useStreamVideoClient();

//   useEffect(() => {
//     let slug: string;

//     if (id !== "call" && id) {
//       //Joining an existing call
//       slug = id.toString();
//       const _call = client?.call("default", slug);
//       _call?.join({ create: false }).then(() => {
//         setCall(_call);
//       })
//     } else {
//       slug= generateSlug(3, {
//         categories: {
//           adjective: ["color", "personality"],
//           noun: ["food", "science"]
//         },
//       });
//       //creating a new call
//       const _call = client?.call("default", slug);
//       _call?.join({ create: true }).then(() => {
//         //have a toast popup...

//         Toast.show(
//           "Call Created Successfully \n Tap here to copy the call ID to share!",
//           {
//             duration: Toast.durations.LONG,
//             position: Toast.positions.CENTER,
//             shadow: true,
//             onPress: async () => {
//                copySlug(slug);
//             }
//           }
//         )
//         setCall(_call);
//       })
//     }

//     setSlug(slug);
//   }, [id, client]);
 
//   useEffect(() => {
//     //clean up functions run when the component unmounts
//     if(call?.state.callingState !== CallingState.LEFT) {
//       call?.leave();
//     }
//   }, [call]);

//   if (!call || !slug) {
//     return (
//       <View style={{
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#cf1010'
//       }}>
//         <ActivityIndicator size="large"/>
//       </View>
//     )
//   }

//   return (
//     <StreamCall call={call}>
//       <Room slug={slug} />
//     </StreamCall>
//   )
// }

// export default CallScreen

// const styles = StyleSheet.create({})