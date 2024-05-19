import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, View, Text, StyleSheet, Image } from 'react-native';

import Colors from '@/src/constants/Colors';
import { useColorScheme } from '@/src/components/useColorScheme';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.mainContainer}>
      <Logomodal />
      <Welcomeuser />
      <Icons />
    </View>
  );
}

const Logomodal = () => {
  const colorScheme = useColorScheme();
  return (
    <View style={styles.container}>
      <Image style={styles.tinyLogo} source={require('../../../assets/images/CIcon.png')} />
      <View style={styles.modal}>
        <Link href="/modal" asChild>
          <Pressable>
            {({ pressed }) => (
              <FontAwesome
                name="info-circle"
                size={40}
                color={Colors[colorScheme ?? 'light'].text}
                style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

const Welcomeuser = () => {
  return (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeText}>
        Welcome back!
      </Text>
      <Text style={styles.userText}>
        User
      </Text>
    </View>
  );
}

const Icons = () => {
  return (
    <View style={styles.IconsContainer}>
      <View style={styles.iconWrapper}>
        <FontAwesome name="car" size={40} color="black" />
        <Text style={styles.iconText}>
          Parking Availability
        </Text>
      </View>
      <View style={styles.iconWrapper}>
        <FontAwesome5 name="bus" size={40} color="black" />
        <Text style={styles.iconText}>
          Bus
        </Text>
      </View>
      <View style={styles.iconWrapper}>
        <FontAwesome5 name="taxi" size={40} color="black" />
        <Text style={styles.iconText}>
          Taxi
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "pink"
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  tinyLogo: {
    height: 100,
    width: 100,
    marginRight: 10,
  },
  modal: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 10,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 25,
    marginRight: 5,
  },
  userText: {
    fontSize: 25,
    color: 'blue',
  },
  IconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  iconWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    marginTop: 10,
    textAlign: 'center',
  },
});

//export default TabLayout;
