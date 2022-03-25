import React from 'react'
//import React

import { CommonActions } from '@react-navigation/native';

import StyleSheet from 'react-native-media-query';

import { TouchableOpacity, Alert, Animated, View, Dimensions, ImageBackground, KeyboardAvoidingView, SafeAreaView, FlatList, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native'
//import React Native basic components

import LinearGradient from 'react-native-linear-gradient';
//import LinearGradient Componet to make Linear Gradient

import { Input, Button, Text } from 'react-native-elements'
//import for the form

import Icon from 'react-native-vector-icons/FontAwesome';
//import Icon Component to get the icons

import Spinner from 'react-native-loading-spinner-overlay';
//Spinner for the loading

import Autocomplete from 'react-native-autocomplete-input';
//Autocomplete for name

import { ListItem, Avatar } from 'react-native-elements';

import * as api from "../services/auth";

import { useAuth } from "../providers/auth";

const {
    Value
} = Animated;



const Entrance = ({ navigation, route }) => {

    const [fadeAnim, setFadeAnim] = React.useState(new Value(0));
    const [truckData, setTruckData] = React.useState(false);
    const [BtnSaveExit, setBtnSaveExit] = React.useState(false);
    const [isSearch, setIsSearch] = React.useState(false);
    const [plate, setPlate] = React.useState('');
    const [driverName, setDriverName] = React.useState('');
    const [GPS, setGPS] = React.useState('');
    const [mica, setMica] = React.useState('');
    const [companyName, setCompanyName] = React.useState('');
    const [bedColor, setBedColor] = React.useState('');
    const [truckColor, setTruckColor] = React.useState('');
    const [truckType, setTruckType] = React.useState('');
    const [seeMaterials, setSeeMaterials] = React.useState(false);
    const [materials, setMaterials] = React.useState();
    const [errorPlate, setErrorPlate] = React.useState('');
    const [idLog, setIdLog] = React.useState('');
    const [errorDriver, setErrorDriver]= React.useState('');
    const [errorCompany, setErrorCompany]= React.useState('');
    const [errorGPS, setErrorGPS]= React.useState('');

    const [namesList, setNamesList]= React.useState([]);
    const [filteredNames, setFilteredNames]= React.useState([]);
    const [companiesList, setCompaniesList]= React.useState([]);
    const [filteredCompanies, setFilteredCompanies]= React.useState([]);

    //const [selectedName, setSelectedName]= React.useState('');

    //const { width, height } = Dimensions.get('window');
    //const [widthAutoComplete, setWidthAutoComplete]= React.useState(width<=480?"100%":"33%");


    const keyboardVerticalOffset = Platform.OS === 'ios' ? -50 : 0;
   

    /*Dimensions.addEventListener('change', () => {
        const { width, height } = Dimensions.get('window');
        setWidthAutoComplete(width<=480?"100%":"33%");
    });*/

    async function obtainDrivers() {        
        setIsSearch(true);
        try {
            response = await api.getDrivers();
            //console.log(response);
            setNamesList(response.drivers);
            setCompaniesList(response.companies);
            setIsSearch(false);
        } catch (e) {
        }
    }

    const loadComponents = () => {        
        //setNamesList([{name: "Alan"},{name:"Alberto"},{name:"Valeria"},{name:"Valentina"}]);
        obtainDrivers();
        Animated.timing(
            fadeAnim,
            {
                toValue: 1,
                duration: 700,
                useNativeDriver: true
            }
        ).start()
    }

    async function search(state) {
        setIsSearch(true);
        setSeeMaterials(false);
        if (state == '' || plate == '') {
            setTruckData(false);
            setIsSearch(false);
        }
        try {

            if (state == undefined)
                response = await api.isLeavingTruck({ plate })
            else {
                response = await api.isLeavingTruck({ 'plate': state })
            }            
            setTruckType(response["type"]);
            setBedColor(response["bedColor"]);
            setTruckColor(response["truckColor"]);    
            setDriverName("");
            setCompanyName("");        
            if (response.isExit == 1) {
                //Activar el boton
                if(response["gps"]==plate){//Dieron el gps
                    setPlate(response["plate"]);
                }
                setIdLog(response.idLog);
                setDriverName(response["driver"]);
                setCompanyName(response["company"]);
                setGPS(response["gps"]);
                setBtnSaveExit(true);
            } else {
                response = await api.getAvailableMaterials();
                setMaterials(response.materials);
                setBtnSaveExit(false);                
            }
            setTruckData(true);
            setErrorPlate("");
            setErrorCompany("");
            setErrorDriver("");
            setErrorGPS("");
            setIsSearch(false);
        } catch (e) {
            setTruckData(false);
            setIsSearch(false);
            setErrorPlate(e.message);
            setTruckType("");
            setBedColor("");
            setTruckColor("");
            setErrorCompany("");
            setErrorDriver("");
            setErrorGPS("");
        }        

    }

    async function searchGPS(){
        if (GPS == '')
            setErrorGPS("El GPS no puede estar vacio");
        else{
            setIsSearch(true);
            response = await api.existGPS({ gps: GPS });            
            /*if (response.exist){
                setErrorGPS("");
            }else{
                setErrorGPS("El GPS no existe");
            }*/
            setErrorGPS(response.exist);
            setIsSearch(false);
        }
    }

    const AsyncAlertSalida = () => {
        return new Promise((resolve, reject) => {
            Alert.alert(
                'Retirar GPS!',
                'FAVOR DE RETIRAR GPS.',
                [
                    { text: 'OK', onPress: () => resolve('YES') }
                ],
                { cancelable: false }
            )
        })
    }

    const AsyncAlert = () => {
        return new Promise((resolve, reject) => {
            Alert.alert(
                'Salida registrada!',
                'La salida del vehiculo fue registrada exitosamente.',
                [
                    { text: 'OK', onPress: () => resolve('YES') }
                ],
                { cancelable: false }
            )
        })
    }

    const AsyncAlertEntrada = () => {
        return new Promise((resolve, reject) => {
            Alert.alert(
                'Entrada registrada!',
                'La entrada del vehiculo fue registrada exitosamente.',
                [
                    { text: 'OK', onPress: () => resolve('YES') }
                ],
                { cancelable: false }
            )
        })
    }

    async function saveExit() {
        //setIsSearch(true);
        existError = false;
        if (plate == '') {
            setErrorPlate("Debe ingresar la placa del camión");
            existError = true;
        }
        if (!existError) {
            /* Enviar a guardar la hora */
            try {
                await AsyncAlertSalida();
                let response = await api.saveExit({ idLog });
                await AsyncAlert();
                //Enviar a ...
                //navigation.navigate("Entradas",{screen: 'Escaner', params:{plateX: plate}})
                navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Entradas' }], }));
            } catch (e) {
                
            }
        }


    }

    async function goTo(idMaterial) {
        setIsSearch(true);
        try {
            let response = await api.registerArrival({ plate, idMaterial, driverName, companyName, GPS, mica })
            setIsSearch(false);
            await AsyncAlertEntrada();
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Entradas' }], }));
            //navigation.navigate("GotoBuilding", { building: response.building, plate: plate, nameMaterial: response.nameMaterial })            
        } catch (e) {
            setIsSearch(false);
        }
    }

    renderItem = ({ item }) => {
        return (

            <ListItem
                button={true}
                onPress={() => goTo(item.idMaterial)}
                roundAvatar
                bottomDivider={true}
            >
                <Avatar
                    rounded
                    source={{ uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg' }}
                    title={item.nameMaterial.substring(0, 2)}
                />
                <ListItem.Content>
                    <ListItem.Title>{item.nameMaterial}</ListItem.Title>
                </ListItem.Content>
            </ListItem>

            
        );
    }

    async function chooseMaterial (){
        existError = false;
        if(driverName==''){
            setErrorDriver('El nombre del conductor no puede estar vacio');
            existError=true;
        }
        if(companyName==''){
            setErrorCompany("El nombre de la compañia fletera no puede estar vacio");
            existError=true;
        }
        if(GPS==''){
            setErrorGPS("El GPS no puede estar vacio");
            existError=true;
        } 
        response = await api.existGPS({ gps: GPS });
        if (response.exist!=""){
            setErrorGPS("El GPS no existe");
            existError=true;
        }      
        if(!existError)
            setSeeMaterials(true);
    }

    navigateToScanner = () => {
        navigation.navigate('PlateDetection', { toRoute: "Escaner" })
    }

    React.useEffect(() => {                
        if (route.params?.plateX != undefined && route.params?.plateX != '') {
            setPlate(route.params?.plateX);
            search(route.params?.plateX);
        } else {
            setPlate('');
        }
    }, [route.params?.plateX]);

    const findName = (query) => {
        setDriverName(query);
        // Method called every time when we change the value of the input
        if (query) {
          // Making a case insensitive regular expression
          const regex = new RegExp(`${query.trim()}`, 'i');
          // Setting the filtered film array according the query
          setFilteredNames(
              namesList.filter((item) => item.name.search(regex) >= 0)
          );
        } else {
          // If the query is null then return blank
          setFilteredNames([]);
        }
      };

      const findCompany = (query) => {
        setCompanyName(query);
        // Method called every time when we change the value of the input
        if (query) {
          // Making a case insensitive regular expression
          const regex = new RegExp(`${query.trim()}`, 'i');
          // Setting the filtered film array according the query
          setFilteredCompanies(
              companiesList.filter((item) => item.name.search(regex) >= 0)
          );
        } else {
          // If the query is null then return blank
          setFilteredCompanies([]);
        }
      };



    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1 }}>
                <ImageBackground onLoadEnd={loadComponents} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch', backgroundColor: 'transparent', height: "35%" }} source={require('../assets/imgs/bg.jpg')}>
                    <Spinner visible={isSearch} />
                    <Animated.View style={{ opacity: fadeAnim, width: "100%", height: "100%" }}>
                        <LinearGradient colors={['rgba(24, 30, 51,0.2)', 'rgba(24, 30, 51,0.6)']} style={{ flex: 1, overflow: 'visible', width: "100%", height: "100%" }}>
                            <KeyboardAvoidingView keyboardVerticalOffset={keyboardVerticalOffset} behavior={Platform.OS == "ios" ? "padding" : "height"} style={{ width: '100%', height: '100%' }}>
                                <View style={{ width: '100%', height: '100%', flexDirection: 'column', alignItems: "flex-start", justifyContent: "flex-start" }}>
                                    <View style={{ width: "100%", height: "35%", flexDirection: 'column', justifyContent: "flex-end", alignItems: "flex-start" }}>
                                        <Text style={{ color: '#ffffff', fontSize: 40, paddingLeft: '2%', fontWeight: 'bold' }}>ENTRADAS/SALIDAS</Text>
                                    </View>
                                    <View style={{ width: "100%", height: "65%", backgroundColor: '#ffffff', flexDirection: 'column', justifyContent: "space-around", alignItems: "center" }}>
                                        <View style={{ width: "80%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: truckData == true ? "space-around" : "flex-start"}}>
                                            <Input errorMessage={errorPlate} value={plate} placeholder='XXXNNNX' onChangeText={setPlate} label="Placa/GPS" returnKeyType="next" onBlur={() => { search() }} leftIcon={<Icon name={"credit-card"} color={"gray"} size={14}></Icon>}  />
                                            {truckData == true && seeMaterials == false &&
                                                <>                                                    
                                                            <View style={[styles.autocompleteContainer1, {width: "100%"}]}>
                                                                <Text style={{lineHeight:40, paddingHorizontal: 10, bottom:30, fontSize:16, color:"#86939e", fontWeight:"bold"}}>Nombre Conductor</Text>
                                                                <Autocomplete                                                                                          
                                                                    containerStyle={{width:"100%", paddingHorizontal:10, position: 'absolute', zIndex:2}}
                                                                    disabled={BtnSaveExit}
                                                                    onBlur={() => {setFilteredNames([]); (driverName == '') ? setErrorDriver("El nombre del conductor no puede estar vacio") : setErrorDriver("") }}
                                                                    //ref={ref => { drivert = ref; }} 
                                                                    returnKeyType="next"                                                                    
                                                                    onSubmitEditing={() => {setFilteredNames([]);/*companyt.focus();*/}}
                                                                    // renderTextInput={ () => (<TextInput style={{color:"blue"}}/>) }
                                                                    inputContainerStyle={styles.autoCompleteInput}
                                                                    data={filteredNames}
                                                                    placeholder={"Nombre Conductor"}  
                                                                    placeholderTextColor="#86939e"
                                                                    style={{fontSize: 18, color:"black"}}
                                                                    onChangeText={(text) => findName(text)}
                                                                    value={driverName}
                                                                    flatListProps={{
                                                                        keyboardShouldPersistTaps: 'always',
                                                                        keyExtractor: (_, idx) => idx,
                                                                        renderItem: ({ item}) => (
                                                                        <TouchableOpacity 
                                                                            onPress={() => {
                                                                                setDriverName(item.name);
                                                                                setFilteredNames([]);
                                                                            }}            
                                                                        >
                                                                            <Text>{item.name}</Text>
                                                                        </TouchableOpacity>
                                                                        ),
                                                                    }}                                                                                                                         
                                                                />
                                                                <Text style={{margin: 5, paddingHorizontal:10, top:5,fontSize:12, color:"#ff190c"}}>{errorDriver==''?'  ':errorDriver}</Text>
                                                            </View>  
                                                            <View style={[styles.autocompleteContainer2, {width: "100%"}]}>
                                                                <Text style={{paddingHorizontal: 10, bottom:30, lineHeight:40, fontSize:16, color:"#86939e", fontWeight:"bold"}}>Empresa fletera</Text>
                                                                <Autocomplete
                                                                    containerStyle={{width:"100%", paddingHorizontal:10, position: 'absolute', zIndex:1}}
                                                                    disabled={BtnSaveExit}
                                                                    onBlur={() => {setFilteredCompanies([]); (companyName == '') ? setErrorCompany("El nombre de la compañia fletera no puede estar vacio") : setErrorCompany("") }}
                                                                    //ref={ref => { companyt = ref; }}
                                                                    returnKeyType="next" 
                                                                    onSubmitEditing={() => {setFilteredCompanies([]);}}
                                                                    inputContainerStyle={styles.autoCompleteInput}
                                                                    data={filteredCompanies}
                                                                    placeholder={"Empresa fletera"}  
                                                                    placeholderTextColor="#86939e"
                                                                    style={{fontSize: 18, color:"black"}}
                                                                    onChangeText={(text) => findCompany(text)}
                                                                    value={companyName}
                                                                    
                                                                    flatListProps={{
                                                                        keyboardShouldPersistTaps: 'always',
                                                                        keyExtractor: (_, idx) => idx,
                                                                        renderItem: ({ item}) => (
                                                                        <TouchableOpacity 
                                                                            onPress={() => {
                                                                                setCompanyName(item.name);
                                                                                setFilteredCompanies([]);
                                                                            }}
                                                                        >
                                                                            <Text>{item.name}</Text>
                                                                        </TouchableOpacity>
                                                                        ),
                                                                    }}                                                                                                                         
                                                                />
                                                                <Text style={{margin: 5, paddingHorizontal:10, top:5, fontSize:12, color:"#ff190c"}}>{errorCompany==''?'  ':errorCompany}</Text>
                                                            </View>                                                            
                                                    {/* <Input disabled={BtnSaveExit} value={driverName} onBlur={() => { (driverName == '') ? setErrorDriver("El nombre del conductor no puede estar vacio") : setErrorDriver("") }} errorMessage={errorDriver} ref={ref => { drivert = ref; }} returnKeyType="next" onSubmitEditing={() => companyt.focus()} placeholder='Conductor' onChangeText={setDriverName} label="Conductor" /> */}
                                                    {/* <Input disabled={BtnSaveExit} value={companyName} onBlur={() => { (companyName == '') ? setErrorCompany("El nombre de la compañia fletera no puede estar vacio") : setErrorCompany("") }} errorMessage={errorCompany} ref={ref => { companyt = ref; }} returnKeyType="next" placeholder='Empresa fletera' onChangeText={setCompanyName} label="Empresa fletera"  onSubmitEditing={() => gpst.focus()}/> */}
                                                    <Input disabled={BtnSaveExit} value={mica} returnKeyType="next"  placeholder='Mica' onChangeText={setMica} label="Mica" />
                                                    <Input  disabled={BtnSaveExit} value={GPS} onBlur={() => { searchGPS() }} errorMessage={errorGPS} returnKeyType="done" onSubmitEditing={() => chooseMaterial()} placeholder='GPS' onChangeText={setGPS} label="GPS" />                                                    
                                                    <Button icon={<Icon name={BtnSaveExit==false?"arrow-right":"save"} color={"white"} size={17}></Icon>} title={BtnSaveExit==false?"Siguiente   ":"Guardar   "} iconRight onPress={() => { BtnSaveExit==false?chooseMaterial():saveExit() }} />
                                                </>
                                            }
                                            {truckData == true && seeMaterials == true &&
                                                <>                                                    
                                                    <View style={{ flexDirection: 'column', height: '70%', justifyContent: 'flex-start', width: "100%", borderColor: '#b8b8b8', borderWidth: 1 }}>
                                                        <View style={{ height: '15%', backgroundColor: '#181e33', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                                                            <Text style={{ marginLeft: '5%', fontSize: 16, fontWeight: 'bold', height: 20, color: '#FFFFFF' }}>Selecciona un material: </Text>
                                                            <Icon style={{ marginRight: '5%', color: '#FFFFFF' }} name={'chevron-down'} size={20} />
                                                        </View>                                                    
                                                        <SafeAreaView style={{ flex: 1, justifyContent: "center", backgroundColor: "#F5FCFF" }}>
                                                            <FlatList
                                                                data={materials}
                                                                renderItem={renderItem}
                                                                keyExtractor={item => item.idMaterial}
                                                            />
                                                        </SafeAreaView>
                                                    </View>
                                                </>

                                            }
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                        </LinearGradient>
                    </Animated.View>
                </ImageBackground>
            </View>
        </TouchableWithoutFeedback>
    );


}

//   flex: 1,
    //   left: 0,
    //   position: 'absolute',
    //   right: 0,
    //   top: 0,
    //   

const {ids, styles} = StyleSheet.create({
    autocompleteContainer1: {
        //paddingHorizontal: 10,
        //zIndex: 2
    },
    autocompleteContainer2: {
        //paddingHorizontal: 10,
        //zIndex: 1
    },
    autoCompleteInput: {
        borderWidth: 0, 
        borderBottomWidth: 1,
        borderColor: "#86939e",        
        //paddingHorizontal: 10
    },
    listAutoComplete:{
        backgroundColor:"red"
    }

  });

export default Entrance