import { StyleSheet, Button,  Pressable, Image, TouchableOpacity } from 'react-native';

//import EditScreenInfo from '@/src/components/EditScreenInfo';
import { Text, View } from '@/src/components/Themed';
import { useNavigation } from '@react-navigation/native';

export default function BusTiming() {
    return (
        <View>
            <Header />
            <BusStops />
            <NavigationTab />
        </View>
    );
}

const Header = () => {
    return (
        <View className=" bg-blue-500">
            <Text className="text-white text-xl font-bold">Bus Stops</Text>
        </View>
    );
};

const BusStops = () => {
    const busStops = [
        { name: "University Town", shortName: "UTown", distance: 190 },
        { name: "Central Library", shortName: "CL", distance: 200 },
        { name: "Arts", shortName: "Arts", distance: 300 },
    ];

    return (
        <View>
            {busStops.map((busStop) => (
                <BusStop
                key={busStop.shortName}
                    name={busStop.name}
                    shortName={busStop.shortName}
                    distance={busStop.distance}
                />
            ))}
        </View>
    );
};

type BusStopProps = {
    name: string;
    shortName: string;
    distance: number;
};

const BusStop = ({ name, shortName, distance }: BusStopProps) => {
    return (
        <View className="flex-row">
            <Button title="Fav" />
            <View>
                <View className="flex flex-row">
                    <Text>{name}</Text>
                    <Text>{distance}</Text>
                </View>
                <Text>{shortName}</Text>
            </View>
            <Button title="Refresh" />
        </View>
    );
};
const NavigationTab = () => {
    return (
        <View>
            <Text>NavigationTab</Text>
        </View>
    );
};

/*const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});*/
