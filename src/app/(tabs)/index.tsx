import { StyleSheet, Image } from 'react-native';

import EditScreenInfo from '@/src/components/EditScreenInfo';
import { Text, View } from '@/src/components/Themed';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Image style={imagestyle.tinyLogo}
        source={require('../../../assets/images/CheckitIcon.jpg')}
      />

    </View>
  );
}


const imagestyle = StyleSheet.create({
  container: {
    paddingTop: 50
  },
  tinyLogo: {
    width: 50,
    height: 50
  },
  Logo: {
    width: 66,
    height: 58
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
