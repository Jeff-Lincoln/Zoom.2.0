import { formatSlug } from "@/lib/slugs";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons, Feather, Entypo } from "@expo/vector-icons";
import { Call, useStreamVideoClient } from "@stream-io/video-react-native-sdk";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Image, Switch } from "react-native";
import Dialog from "react-native-dialog";

export default function Index() {
  const client = useStreamVideoClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMyCalls, setIsMyCalls] = useState(false);
  const [calls, setCalls] = useState<Call[]>([]);

  const handleSignOut = async () => {
    await signOut();
    setDialogOpen(false);
  };

  const fetchCalls = async () => {
    if (!client || !user) return;

    const { calls } = await client.queryCalls({
      filter_conditions: isMyCalls
        ? {
            $or: [
              { created_by_user_id: user.id },
              { members: { $in: [user.id] } },
            ],
          }
        : {},
      sort: [{ field: "created_at", direction: -1 }],
      watch: true,
    });
    setCalls(calls);
  };

  useEffect(() => {
    fetchCalls();
  }, [isMyCalls]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCalls();
    setIsRefreshing(false);
  };

  const handleJoinRoom = (id: string) => {
    router.push(`/(call)/${id}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.switchContainer}>
          <Text
            style={{
              color: isMyCalls ? "black" : '#5F5DEC',
              fontWeight: isMyCalls ? "bold" : "normal",
            }}
            onPress={() => setIsMyCalls(false)}
          >
            All Calls
          </Text>

          <Switch
            trackColor={{ false: "#5F5DEC", true: "#5F5DEC" }}
            thumbColor="white"
            ios_backgroundColor="#5f5dec"
            onValueChange={() => setIsMyCalls(!isMyCalls)}
            value={isMyCalls}
          />

          <Text
            style={{
              color: isMyCalls ? '#5F5DEC' : "black",
              fontWeight: isMyCalls ? "bold" : "normal",
            }}
            onPress={() => setIsMyCalls(true)}
          >
            My Calls
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={() => setDialogOpen(true)}>
          <MaterialCommunityIcons name="exit-run" size={24} color="#5F5DEC" />
        </TouchableOpacity>
      </View>

      {/* Sign-out Dialog */}
      <Dialog.Container visible={dialogOpen}>
       <Dialog.Title>Sign-Out</Dialog.Title>
        <Dialog.Description>Are you sure you want to sign out?🤔</Dialog.Description>
        <Dialog.Button label="Cancel" onPress={() => setDialogOpen(false)} />
        <Dialog.Button label="Sign out" onPress={handleSignOut} />
      </Dialog.Container>

      {/* Calls List */}
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleJoinRoom(item.id)}
            disabled={item.state.participantCount === 0}
            style={[
              styles.callItem,
              item.state.participantCount === 0 && styles.callItemDisabled,
            ]}
          >
            <Image
              source={{ uri: item.state.createdBy?.image }}
              style={styles.profileImage}
            />

            <View style={styles.callDetails}>
              <Text style={styles.callTitle}>
                {item.state.createdBy?.name || item.state.createdBy?.custom.email.split("@")[0]}
              </Text>
              <Text style={styles.callEmail}>
                {item.state.createdBy?.custom.email}
              </Text>
              <Text style={styles.callId}>
                {formatSlug(item.id)}
              </Text>
            </View>

            <View style={styles.participantContainer}>
              {item.state.participantCount === 0 ? (
                <Text style={styles.callEnded}>Call Ended</Text>
              ) : (
                <View style={styles.participantBadge}>
                  <Entypo name="users" size={14} color="#fff" />
                  <Text style={styles.participantCount}>
                    {item.state.participantCount}
                  </Text>
                </View>
              )}
              <Feather name="phone-call" size={20} color="gray" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff", // Set background to white for the header
    elevation: 3, // Slight shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // Center the switch in the available space
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10,
    flex: 1,
    shadowOpacity: 0.2,
  },
  signOutButton: {
    marginLeft: 5,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  listContainer: {
    marginTop: 10,
    paddingHorizontal: 12,
    marginBottom: 0,
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  callItemDisabled: {
    backgroundColor: "#e0e0e0",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  callDetails: {
    flex: 1,
    justifyContent: "center",
  },
  callTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  callEmail: {
    fontSize: 12,
    color: "#888",
  },
  callId: {
    fontSize: 10,
    color: "#555",
  },
  participantContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  callEnded: {
    fontSize: 10,
    color: "#e63946",
  },
  participantBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5F5DEC",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginBottom: 4,
  },
  participantCount: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
  },
});



// import { formatSlug } from "@/lib/slugs";
// import { useAuth, useUser } from "@clerk/clerk-expo";
// import { MaterialCommunityIcons, Feather, Entypo } from "@expo/vector-icons";
// import { Call, useStreamVideoClient } from "@stream-io/video-react-native-sdk";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { FlatList, Text, TouchableOpacity, View, StyleSheet, Image, Switch } from "react-native";
// import Dialog from "react-native-dialog";

// export default function Index() {
//   const client = useStreamVideoClient();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const { signOut } = useAuth();
//   const { user } = useUser();

//   const router = useRouter();
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isMyCalls, setIsMyCalls] = useState(false);
//   const [calls, setCalls] = useState<Call[]>([]);

//   const handleSignOut = async () => {
//     await signOut();
//     setDialogOpen(false);
//   };

//   const fetchCalls = async () => {
//     if (!client || !user) return;

//     const { calls } = await client.queryCalls({
//       filter_conditions: isMyCalls
//         ? {
//             $or: [
//               { created_by_user_id: user.id },
//               { members: { $in: [user.id] } },
//             ],
//           }
//         : {},
//       sort: [{ field: "created_at", direction: -1 }],
//       watch: true,
//     });
//     setCalls(calls);
//   };

//   useEffect(() => {
//     fetchCalls();
//   }, [isMyCalls]);

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await fetchCalls();
//     setIsRefreshing(false);
//   };

//   const handleJoinRoom = (id: string) => {
//     router.push(`/call/${id}`);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header with Switch */}
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Calls</Text>
//         <View style={styles.switchContainer}>
//           <Text
//             style={[styles.switchLabel, !isMyCalls && styles.activeLabel]}
//             onPress={() => setIsMyCalls(false)}
//           >
//             All Calls
//           </Text>
//           <Switch
//             trackColor={{ false: "#767577", true: "#4CAF50" }}
//             thumbColor={isMyCalls ? "#fff" : "#fff"}
//             onValueChange={() => setIsMyCalls(!isMyCalls)}
//             value={isMyCalls}
//           />
//           <Text
//             style={[styles.switchLabel, isMyCalls && styles.activeLabel]}
//             onPress={() => setIsMyCalls(true)}
//           >
//             My Calls
//           </Text>
//         </View>
//         <TouchableOpacity onPress={() => setDialogOpen(true)}>
//           <MaterialCommunityIcons name="exit-run" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Sign Out Dialog */}
//       <Dialog.Container visible={dialogOpen}>
//         <Dialog.Title>Sign Out</Dialog.Title>
//         <Dialog.Description>Are you sure you want to sign out?</Dialog.Description>
//         <Dialog.Button label="Cancel" onPress={() => setDialogOpen(false)} />
//         <Dialog.Button label="Sign out" onPress={handleSignOut} />
//       </Dialog.Container>

//       {/* Call List */}
//       <FlatList
//         data={calls}
//         keyExtractor={(item) => item.id}
//         refreshing={isRefreshing}
//         onRefresh={handleRefresh}
//         contentContainerStyle={styles.listContainer}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             key={item.id}
//             onPress={() => handleJoinRoom(item.id)}
//             disabled={item.state.participantCount === 0}
//             style={[
//               styles.callItem,
//               item.state.participantCount === 0 && styles.callItemDisabled,
//             ]}
//           >
//             <View style={styles.callIconContainer}>
//               {item.state.participantCount === 0 ? (
//                 <Feather name="phone-off" size={22} color="gray" />
//               ) : (
//                 <Feather name="phone-call" size={22} color="#4CAF50" />
//               )}
//             </View>

//             <Image
//               source={{ uri: item.state.createdBy?.image }}
//               style={styles.profileImage}
//             />

//             <View style={styles.callDetails}>
//               <Text style={styles.callTitle}>
//                 {item.state.createdBy?.name || item.state.createdBy?.custom.email.split("@")[0]}
//               </Text>
//               <Text style={styles.callEmail}>
//                 {item.state.createdBy?.custom.email}
//               </Text>
//               <Text style={styles.callId}>
//                 {formatSlug(item.id)}
//               </Text>
//             </View>

//             <View style={styles.callMeta}>
//               {item.state.participantCount === 0 ? (
//                 <Text style={styles.callEnded}>Call Ended</Text>
//               ) : (
//                 <View style={styles.participantBadge}>
//                   <Entypo name="users" size={14} color="#fff" />
//                   <Text style={styles.participantCount}>
//                     {item.state.participantCount}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#121212", // Dark theme background
//     paddingHorizontal: 10,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 15,
//     backgroundColor: "#1F1F1F",
//     paddingHorizontal: 16,
//     borderBottomLeftRadius: 12,
//     borderBottomRightRadius: 12,
//     elevation: 3,
//   },
//   headerText: {
//     color: "#ffffff",
//     fontWeight: "bold",
//     fontSize: 22,
//   },
//   switchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   switchLabel: {
//     fontSize: 16,
//     color: "#ccc",
//     marginHorizontal: 8,
//   },
//   activeLabel: {
//     color: "#4CAF50", // Active label color
//     fontWeight: "bold",
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
//   callItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 14,
//     backgroundColor: "#1F1F1F",
//     marginBottom: 12,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   callItemDisabled: {
//     backgroundColor: "#2E2E2E", // Lighter shade for disabled calls
//   },
//   callIconContainer: {
//     marginRight: 16,
//   },
//   profileImage: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     marginRight: 16,
//   },
//   callDetails: {
//     flex: 1,
//   },
//   callTitle: {
//     color: "#FFFFFF",
//     fontWeight: "bold",
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   callEmail: {
//     fontSize: 13,
//     color: "#888888", // Subtle text color for email
//     marginBottom: 4,
//   },
//   callId: {
//     fontSize: 12,
//     color: "#A0A0A0", // Muted call ID color
//   },
//   callMeta: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   callEnded: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#E57373", // Light red for ended calls
//   },
//   participantBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#4CAF50", // Green for active calls
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 4,
//   },
//   participantCount: {
//     color: "#fff",
//     fontWeight: "bold",
//     marginLeft: 4,
//   },
// });



// // import { formatSlug } from "@/lib/slugs";
// // import { useAuth, useUser } from "@clerk/clerk-expo";
// // import { MaterialCommunityIcons, Feather, Entypo } from "@expo/vector-icons";
// // import { Call, useStreamVideoClient } from "@stream-io/video-react-native-sdk";
// // import { useRouter } from "expo-router";
// // import { useEffect, useState } from "react";
// // import { FlatList, Text, TouchableOpacity, View, StyleSheet, Image, Switch } from "react-native";
// // import Dialog from "react-native-dialog";

// // export default function Index() {
// //   const client = useStreamVideoClient();
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const { signOut } = useAuth();
// //   const { user } = useUser();

// //   const router = useRouter();
// //   const [isRefreshing, setIsRefreshing] = useState(false);
// //   const [isMyCalls, setIsMyCalls] = useState(false);
// //   const [calls, setCalls] = useState<Call[]>([]);

// //   const handleSignOut = async () => {
// //     await signOut();
// //     setDialogOpen(false);
// //   };

// //   const fetchCalls = async () => {
// //     if (!client || !user) return;

// //     const { calls } = await client.queryCalls({
// //       filter_conditions: isMyCalls
// //         ? {
// //             $or: [
// //               { created_by_user_id: user.id },
// //               { members: { $in: [user.id] } },
// //             ],
// //           }
// //         : {},
// //       sort: [{ field: "created_at", direction: -1 }],
// //       watch: true,
// //     });
// //     setCalls(calls);
// //   };

// //   useEffect(() => {
// //     fetchCalls();
// //   }, [isMyCalls]);

// //   const handleRefresh = async () => {
// //     setIsRefreshing(true);
// //     await fetchCalls();
// //     setIsRefreshing(false);
// //   };

// //   const handleJoinRoom = (id: string) => {
// //     router.push(`/call/${id}`);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.header}>
// //         <Text style={styles.title}>My Calls</Text>
// //         <TouchableOpacity
// //           style={styles.signOutButton}
// //           onPress={() => setDialogOpen(true)}
// //         >
// //           <MaterialCommunityIcons name="exit-run" size={24} color="#5F5DEC" />
// //         </TouchableOpacity>
// //       </View>

// //       <Dialog.Container visible={dialogOpen}>
// //         <Dialog.Title>Sign Out</Dialog.Title>
// //         <Dialog.Description>Are you sure you want to sign out?</Dialog.Description>
// //         <Dialog.Button label="Cancel" onPress={() => setDialogOpen(false)} />
// //         <Dialog.Button label="Sign out" onPress={handleSignOut} />
// //       </Dialog.Container>

// //       {/** */}
// //       {/** should replace this with the header above..remove the header above
// //        * and use this..below
// //        */}
// //              <View style={{
// //         flexDirection: 'row',
// //         justifyContent:'space-between',
// //         paddingHorizontal: 16,
// //         paddingVertical: 12,
// //         backgroundColor: '#F5F5F5',
// //       }}>
// //         <Text
// //         style={{
// //           color: isMyCalls ? "black" : '#5F5DEC',
// //         }}
// //         onPress={() => setIsMyCalls(false)}>
// //           All Calls
// //         </Text>

// //         <Switch 
// //         trackColor={{ false: "#5F5DEC", true: "#5F5DEC"}}
// //         thumbColor="white"
// //         ios_backgroundColor="#5f5dec"
// //         onValueChange={() => setIsMyCalls(!isMyCalls)}
// //         value={isMyCalls}
// //         />
// //         <Text
// //         style={{
// //           color: isMyCalls ? "black" : '#5F5DEC',
// //         }}
// //         onPress={() => setIsMyCalls(true)}>
// //           My Calls
// //         </Text>
// //       </View>
// //       {/** */}

// //       <FlatList
// //         data={calls}
// //         keyExtractor={(item) => item.id}
// //         refreshing={isRefreshing}
// //         onRefresh={handleRefresh}
// //         contentContainerStyle={styles.listContainer}
// //         renderItem={({ item }) => (
// //           <TouchableOpacity
// //             key={item.id}
// //             onPress={() => handleJoinRoom(item.id)}
// //             disabled={item.state.participantCount === 0}
// //             style={[
// //               styles.callItem,
// //               item.state.participantCount === 0 && styles.callItemDisabled,
// //             ]}
// //           >
// //             {item.state.participantCount === 0 ? (
// //               <Feather name="phone-off" size={24} color="gray" />
// //             ) : (
// //               <Feather name="phone-call" size={20} color="gray" />
// //             )}

// //             <Image
// //               source={{ uri: item.state.createdBy?.image }}
// //               style={styles.profileImage}
// //             />

// //             <View style={styles.callDetails}>
// //               <View style={styles.callInfo}>
// //                 <View>
// //                   <Text style={styles.callTitle}>
// //                     {item.state.createdBy?.name ||
// //                       item.state.createdBy?.custom.email.split("@")[0]}
// //                   </Text>
// //                   <Text style={styles.callEmail}>
// //                     {item.state.createdBy?.custom.email}
// //                   </Text>
// //                 </View>
// //                 <View style={{
// //                   alignItems: 'flex-end',
// //                   gap: 10,
// //                 }}>
// //                   <Text style={styles.callId}>
// //                     {formatSlug(item.id)}
// //                   </Text>
// //                   <View style={styles.participantContainer}>
// //                     {item.state.participantCount === 0 ? (
// //                       <Text style={styles.callEnded}>Call Ended</Text>
// //                     ) : (
// //                       <View style={styles.participantBadge}>
// //                         <Entypo name="users" size={14} color="#fff" />
// //                         <Text style={styles.participantCount}>
// //                           {item.state.participantCount}
// //                         </Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>
// //             </View>
// //           </TouchableOpacity>
// //         )}
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#f0f4f8",
// //   },
// //   header: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     padding: 20,
// //     backgroundColor: "#5F5DEC",
// //   },
// //   title: {
// //     fontSize: 24,
// //     color: "#fff",
// //     fontWeight: "bold",
// //   },
// //   signOutButton: {
// //     padding: 10,
// //     backgroundColor: "#fff",
// //     borderRadius: 50,
// //   },
// //   listContainer: {
// //     paddingHorizontal: 0,
// //     paddingTop: 10,
// //   },
// //   callItem: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     padding: 20,
// //     backgroundColor: "#fff",
// //     marginBottom: 10,
// //     borderRadius: 8,
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 6,
// //     elevation: 3,
// //   },
// //   callItemDisabled: {
// //     backgroundColor: "#e0e0e0",
// //   },
// //   profileImage: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //     marginRight: 20,
// //   },
// //   callDetails: {
// //     flex: 1,
// //     justifyContent: "space-between",
// //   },
// //   callInfo: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   callTitle: {
// //     fontWeight: "bold",
// //     fontSize: 16,
// //   },
// //   callEmail: {
// //     fontSize: 12,
// //     color: "#888",
// //   },
// //   callId: {
// //     fontSize: 10,
// //     textAlign: "right",
// //     width: 100,
// //     color: "#555",
// //   },
// //   participantContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginTop: 5,
// //   },
// //   callEnded: {
// //     fontSize: 10,
// //     fontWeight: "bold",
// //     color: "#e63946",
// //   },
// //   participantBadge: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#5F5DEC",
// //     paddingVertical: 5,
// //     paddingHorizontal: 10,
// //     borderRadius: 5,
// //   },
// //   participantCount: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //     marginLeft: 6,
// //   },
// // });


// // // import { useAuth, useUser } from "@clerk/clerk-expo";
// // // import { MaterialCommunityIcons } from "@expo/vector-icons";
// // // import { Call, useStreamVideoClient } from "@stream-io/video-react-native-sdk";
// // // import { useRouter } from "expo-router";
// // // import { useEffect, useState } from "react";
// // // import { FlatList, Text, TouchableOpacity, View } from "react-native";
// // // import Dialog from "react-native-dialog";

// // // export default function Index() {
// // //   const client =  useStreamVideoClient();
// // //   const [dialogOpen, setDialogOpen] = useState(false);
// // //   const { signOut } = useAuth();
// // //   const { user } = useUser();

// // //   const router = useRouter();
// // //   const [isRefreshing, setIsRefreshing] = useState(false);
// // //   const [isMyCalls, setIsMyCalls] = useState(false);
// // //   const [calls, setCalls] = useState<Call[]>([])

// // //   const handleSignOut = async () => {
// // //     await signOut();
// // //     setDialogOpen(false);
// // //   };

// // //   const fetchCalls = async () => {
// // //     if (!client || !user) return;

// // //     const { calls } = await client.queryCalls({
// // //       filter_conditions: isMyCalls
// // //       ? {
// // //         $or: [
// // //           { created_by_user_id: user.id },
// // //           { members: { $in: [user.id] } },
// // //         ]
// // //       } :
// // //       {},
// // //       sort: [{ field: "created_at", direction: -1 }],
// // //       watch: true,
// // //     })

// // //   }

// // //   useEffect(() => {
// // //     fetchCalls();
// // //   }, [isMyCalls]);
  
// // //   const handleRefresh = async () => {
// // //     setIsRefreshing(true);
// // //     await fetchCalls();
// // //     setIsRefreshing(false);
// // //   };

// // //   const handleJoinRoom = (id: string) => {
// // //     router.push(`/call/${id}`);
// // //   }

// // //   return (
// // //     <View>
// // //       <Text >
// // //         Hello nigga
// // //       </Text>
// // //       <TouchableOpacity
// // //         style={{
// // //           position: 'absolute',
// // //           top: 20,
// // //           right: 20,
// // //           zIndex: 50,
// // //         }}
// // //         onPress={() => setDialogOpen(true)}
// // //       >
// // //         <MaterialCommunityIcons name="exit-run" size={24} color="#5F5DEC" />
// // //       </TouchableOpacity>

// // //       <Dialog.Container visible={dialogOpen}>
// // //         <Dialog.Title>Sign Out</Dialog.Title>
// // //         <Dialog.Description>
// // //           Are you sure you want to sign out?
// // //         </Dialog.Description>
// // //         <Dialog.Button label="Cancel" onPress={() => setDialogOpen(false)} />
// // //         <Dialog.Button label="Sign out" onPress={handleSignOut} />
// // //       </Dialog.Container>

// // //       <FlatList
// // //       data={calls}
// // //       keyExtractor={(item) => item.id}
// // //       refreshing={isRefreshing}
// // //       onRefresh={handleRefresh}
// // //       contentContainerStyle={{
// // //         paddingBottom: 100,
// // //       }}
// // //       renderItem={( {item}) => (
// // //         <TouchableOpacity
// // //         key={item.id}
// // //         onPress={() => handleJoinRoom(item.id)}
// // //         disabled={item.state.participantCount === 0}
// // //         style={{
// // //           padding: 20,
// // //           backgroundColor:
// // //           item.state.participantCount === 0? 'lightgray' : 'white',
// // //           // marginBottom: 10,
// // //           borderBottomWidth: 1,
// // //           borderBottomColor: 
// // //           item.state.participantCount === 0 ? "#fff" : "#f1f1fq",
// // //           flexDirection: 'row',
// // //           alignItems: 'center',
// // //           gap: 10
// // //           // borderRadius: 5,
// // //         }}
// // //         >
// // //           <Text>{item.id}</Text>
// // //         </TouchableOpacity>
// // //       )}
// // //       />
// // //     </View>
// // //   );
// // // }
