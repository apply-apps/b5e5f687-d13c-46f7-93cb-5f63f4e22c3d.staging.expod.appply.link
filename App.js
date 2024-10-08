// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, SafeAreaView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadContacts();
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const loadContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('contacts');
      if (storedContacts !== null) {
        setContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const saveContacts = async (newContacts) => {
    try {
      await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  const addContact = () => {
    if (name.trim() === '') {
      Alert.alert('Error', 'Name is required');
      return;
    }

    const newContact = { id: Date.now().toString(), name, email, phone, notes, qrCode };
    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    saveContacts(updatedContacts);
    clearForm();
  };

  const clearForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setQrCode('');
  };

  const deleteContact = (id) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    setContacts(updatedContacts);
    saveContacts(updatedContacts);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanning(false);
    setQrCode(data);
  };

  const renderContact = ({ item }) => (
    <View style={styles.contactItem}>
      <View>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.email && <Text style={styles.contactInfo}>{item.email}</Text>}
        {item.phone && <Text style={styles.contactInfo}>{item.phone}</Text>}
        {item.notes && <Text style={styles.contactInfo}>{item.notes}</Text>}
        {item.qrCode && <Text style={styles.contactInfo}>QR: {item.qrCode}</Text>}
      </View>
      <TouchableOpacity onPress={() => deleteContact(item.id)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Networking Event Contacts</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="QR Code"
            value={qrCode}
            onChangeText={setQrCode}
          />
          <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={addContact}>
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      </View>
      <Modal
        visible={scanning}
        onRequestClose={() => setScanning(false)}
      >
        <SafeAreaView style={styles.scannerContainer}>
          {hasPermission === null ? (
            <Text>Requesting for camera permission</Text>
          ) : hasPermission === false ? (
            <Text>No access to camera</Text>
          ) : (
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    fontSize: 14,
    color: '#666',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 5,
    margin: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
// End of App.js