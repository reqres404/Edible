import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { useUserProfile } from '../hooks/useUserProfile';

interface Profile {
  _id?: string;
  name: string;
  age?: number;
  conditions: string[];
  lifestyle?: string;
}

interface ProfileFormData {
  name: string;
  age: string;
  conditions: string;
  lifestyle: string;
}

export const ProfileManager: React.FC = () => {
  const { user, addProfile, updateProfile, deleteProfile, isUpdating } = useUserProfile();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: '',
    conditions: '',
    lifestyle: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      conditions: '',
      lifestyle: '',
    });
    setEditingProfile(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      age: profile.age?.toString() || '',
      conditions: profile.conditions.join(', '),
      lifestyle: profile.lifestyle || '',
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Profile name is required');
      return;
    }

    try {
      const profileData = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        conditions: formData.conditions
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0),
        lifestyle: formData.lifestyle.trim() || undefined,
      };

      if (editingProfile) {
        // Update existing profile
        await updateProfile(editingProfile._id!, profileData);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        // Add new profile
        await addProfile(profileData);
        Alert.alert('Success', 'Profile added successfully');
      }

      closeModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleDeleteProfile = (profile: Profile) => {
    if (!profile._id) return;

    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${profile.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfile(profile._id!);
              Alert.alert('Success', 'Profile deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete profile. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>Please sign in to manage profiles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Manager</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.profilesList}>
        {user.profiles.map((profile, index) => (
          <View key={profile._id || index} style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <View style={styles.profileActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(profile)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                {user.profiles.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProfile(profile)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.profileDetails}>
              {profile.age && (
                <Text style={styles.profileDetail}>Age: {profile.age}</Text>
              )}
              {profile.conditions.length > 0 && (
                <Text style={styles.profileDetail}>
                  Conditions: {profile.conditions.join(', ')}
                </Text>
              )}
              {profile.lifestyle && (
                <Text style={styles.profileDetail}>Lifestyle: {profile.lifestyle}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProfile ? 'Edit Profile' : 'Add New Profile'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Profile Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Age (optional)"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Conditions (comma-separated, optional)"
              value={formData.conditions}
              onChangeText={(text) => setFormData({ ...formData, conditions: text })}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Lifestyle (optional)"
              value={formData.lifestyle}
              onChangeText={(text) => setFormData({ ...formData, lifestyle: text })}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isUpdating}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdating ? 'Saving...' : editingProfile ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  profilesList: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  profileDetails: {
    gap: 4,
  },
  profileDetail: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  noUserText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
});
