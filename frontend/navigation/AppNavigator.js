import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ListsScreen from '../screens/ListsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ListTasksScreen from '../screens/ListTasksScreen'; // Nova tela


const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Lists" component={ListsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen 
        name="ListTasks" 
        component={ListTasksScreen}
        options={({ route }) => ({ title: route.params.listName })}
      />
    </Stack.Navigator>
  );
}