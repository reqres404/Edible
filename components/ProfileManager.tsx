import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import { useUserProfile } from '../hooks/useUserProfile';

const { width: screenWidth } = Dimensions.get('window');

// Color palette for profile avatars
const PROFILE_COLORS = [
  '#D9F0FF', // Light Blue
  '#A3D5FF', // Medium Blue
  '#83C9F4', // Sky Blue
  '#6F73D2', // Purple Blue
  '#7681B3', // Blue Gray
];

// Function to get a consistent color for a profile
const getProfileColor = (profileName: string): string => {
  let hash = 0;
  for (let i = 0; i < profileName.length; i++) {
    hash = profileName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROFILE_COLORS[Math.abs(hash) % PROFILE_COLORS.length];
};

interface Profile {
  _id?: string;
  name: string;
  age?: number;
  allergens?: string[];
  conditions?: string[]; // Keep for backward compatibility
  lifestyle?: string;
}

interface ProfileFormData {
  name: string;
  age: string;
  allergens: string[];
  customAllergen: string;
  lifestyle: string;
}

const ALLERGEN_OPTIONS = [
  'milk', 'eggs', 'fish', 'shellfish', 'peanuts', 'wheat', 'soy', 'sesame seeds',
  'mustard', 'lupin', 'celery', 'sulphites', 'molluscs', 'tree-nuts', 'gluten',
  'dehydrated-fruits', 'oats', 'Honey', 'Natural-Food-Colors', 'mint', 'coriander',
  'Indian-Spices', 'Pollen', 'Seeds', 'Amylase', 'Corn-Flour', 'Crustacean',
  'Starch', 'Dried-Fruits', 'Coconut', 'Barley', 'Other'
];

export const ProfileManager: React.FC = () => {
  const { user, addProfile, updateProfile, deleteProfile, isUpdating } = useUserProfile();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [showCustomAllergenInput, setShowCustomAllergenInput] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: '',
    allergens: [],
    customAllergen: '',
    lifestyle: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const resetForm = () => {
    console.log('🔄 Resetting form');
    const newFormData = {
      name: '',
      age: '',
      allergens: [],
      customAllergen: '',
      lifestyle: '',
    };
    console.log('📋 New form data:', newFormData);
    setFormData(newFormData);
    setEditingProfile(null);
    setIsDropdownOpen(false);
    setFormErrors({});
    setShowCustomAllergenInput(false);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Profile name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (formData.age && (isNaN(parseInt(formData.age)) || parseInt(formData.age) < 1 || parseInt(formData.age) > 120)) {
      errors.age = 'Please enter a valid age (1-120)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const animateModal = (show: boolean) => {
    if (show) {
      setIsModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsModalVisible(false);
        resetForm();
      });
    }
  };

  const openAddModal = () => {
    console.log('📂 Opening add modal');
    resetForm();
    animateModal(true);
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      age: profile.age?.toString() || '',
      allergens: profile.allergens || profile.conditions || [],
      customAllergen: '',
      lifestyle: profile.lifestyle || '',
    });
    animateModal(true);
  };

  const closeModal = () => {
    animateModal(false);
  };

  const toggleAllergen = (allergen: string) => {
    if (allergen === 'Other') {
      setShowCustomAllergenInput(!showCustomAllergenInput);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const addCustomAllergen = () => {
    if (formData.customAllergen.trim()) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, `Custom: ${prev.customAllergen.trim()}`],
        customAllergen: ''
      }));
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  };

  const handleSubmit = async () => {
    console.log('🎯 Handle Submit called');
    console.log('📝 Form Data:', formData);
    console.log('✅ Form validation result:', validateForm());
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed, proceeding...');
    try {
      const profileData = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        allergens: formData.allergens,
        lifestyle: formData.lifestyle.trim() || undefined,
      };

      console.log('📝 Profile Data being sent:', profileData);

      if (editingProfile) {
        // Update existing profile
        console.log('🔄 Updating profile:', editingProfile._id);
        const result = await updateProfile(editingProfile._id!, profileData);
        console.log('✅ Update result:', result);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        // Add new profile
        console.log('➕ Adding new profile');
        const result = await addProfile(profileData);
        console.log('✅ Add result:', result);
        console.log('👤 Current user profiles before sync:', user?.profiles?.length);
        Alert.alert('Success', 'Profile added successfully');
      }

      closeModal();
      console.log('👤 Current user profiles after modal close:', user?.profiles?.length);
    } catch (error) {
      console.error('❌ Profile save error:', error);
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
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <Text style={styles.emptyStateIconText}>👤</Text>
          </View>
          <Text style={styles.emptyStateTitle}>Sign In Required</Text>
          <Text style={styles.emptyStateSubtitle}>Please sign in to manage your profiles and allergen information</Text>
        </View>
      </View>
    );
  }

  const renderProfileItem = ({ item, index }: { item: Profile | 'add'; index: number }) => {
    if (item === 'add') {
      return (
        <TouchableOpacity style={styles.addProfileCard} onPress={openAddModal}>
          <View style={styles.addProfileContent}>
            <Text style={styles.addProfileIcon}>+</Text>
            <Text style={styles.addProfileText}>Add</Text>
          </View>
        </TouchableOpacity>
      );
    }

    const profile = item as Profile;
    const avatarColor = getProfileColor(profile.name);
    return (
      <TouchableOpacity 
        style={styles.compactProfileCard} 
        onPress={() => openEditModal(profile)}
      >
        <View style={[styles.compactProfileAvatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.compactProfileAvatarText}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.compactProfileName}>{profile.name}</Text>
      </TouchableOpacity>
    );
  };

  const data: (Profile | 'add')[] = [...user.profiles, 'add'];

  return (
    <View style={styles.compactContainer}>
      {/* Compact Header */}
      <View style={styles.compactHeader}>
        <Text style={styles.compactTitle}>Profiles</Text>
      </View>

      {/* Compact Profiles List */}
      <FlatList
        data={data}
        renderItem={renderProfileItem}
        keyExtractor={(item, index) => item === 'add' ? 'add' : (item as Profile)._id || index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactListContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Modal
        visible={isModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
                {editingProfile ? 'Edit Profile' : 'Create New Profile'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {editingProfile 
                  ? 'Update your profile information and allergens' 
                  : 'Add a new profile with dietary preferences and allergen information'
                }
            </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Name Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Profile Name *</Text>
            <TextInput
                  style={[
                    styles.input,
                    formErrors.name && styles.inputError
                  ]}
                  placeholder="Enter a name for this profile (e.g., John, Mom, Baby)"
                  placeholderTextColor="#9CA3AF"
              value={formData.name}
                  onChangeText={(text) => {
                    console.log('📝 Name input changed:', text);
                    setFormData({ ...formData, name: text });
                    if (formErrors.name) {
                      setFormErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  maxLength={50}
                />
                {formErrors.name && (
                  <Text style={styles.errorText}>{formErrors.name}</Text>
                )}
              </View>

              {/* Age Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Age (Optional)</Text>
            <TextInput
                  style={[
                    styles.input,
                    formErrors.age && styles.inputError
                  ]}
                  placeholder="Enter age (helps with personalized recommendations)"
                  placeholderTextColor="#9CA3AF"
              value={formData.age}
                  onChangeText={(text) => {
                    setFormData({ ...formData, age: text });
                    if (formErrors.age) {
                      setFormErrors(prev => ({ ...prev, age: '' }));
                    }
                  }}
              keyboardType="numeric"
                  maxLength={3}
                />
                {formErrors.age && (
                  <Text style={styles.errorText}>{formErrors.age}</Text>
                )}
              </View>

              {/* Allergens Section */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Allergens & Dietary Restrictions</Text>
                <Text style={styles.fieldHelper}>
                  Select all allergens and dietary restrictions that apply
                </Text>
                
                {/* Selected Allergens */}
                {formData.allergens.length > 0 && (
                  <View style={styles.selectedAllergensContainer}>
                    <Text style={styles.selectedAllergensTitle}>Selected ({formData.allergens.length}):</Text>
                    <View style={styles.selectedAllergensList}>
                      {formData.allergens.map((allergen, idx) => (
                        <View key={idx} style={styles.selectedAllergenTag}>
                          <Text style={styles.selectedAllergenText}>{allergen}</Text>
                          <TouchableOpacity
                            onPress={() => removeAllergen(allergen)}
                            style={styles.removeAllergenButton}
                            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                          >
                            <Text style={styles.removeAllergenText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Allergen Dropdown */}
                <TouchableOpacity
                  style={styles.allergenDropdownButton}
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <View style={styles.dropdownButtonContent}>
                    <Text style={styles.dropdownButtonIcon}>🥜</Text>
                    <Text style={styles.dropdownButtonText}>
                      {isDropdownOpen ? 'Hide Allergen List' : 'Browse Allergens & Restrictions'}
                    </Text>
                  </View>
                  <Text style={styles.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isDropdownOpen && (
                  <View style={styles.allergenDropdownContainer}>
                    <Text style={styles.dropdownHeader}>Select all that apply:</Text>
                    <ScrollView style={styles.allergenDropdownScroll} nestedScrollEnabled>
                      {ALLERGEN_OPTIONS.map((allergen) => (
                        <TouchableOpacity
                          key={allergen}
                          style={[
                            styles.allergenDropdownItem,
                            formData.allergens.includes(allergen) && styles.allergenDropdownItemSelected
                          ]}
                          onPress={() => toggleAllergen(allergen)}
                        >
                          <View style={styles.allergenItemContent}>
                            <View style={[
                              styles.allergenCheckbox,
                              formData.allergens.includes(allergen) && styles.allergenCheckboxSelected
                            ]}>
                              {formData.allergens.includes(allergen) && (
                                <Text style={styles.allergenCheckboxCheck}>✓</Text>
                              )}
                            </View>
                            <Text style={[
                              styles.allergenItemText,
                              formData.allergens.includes(allergen) && styles.allergenItemTextSelected
                            ]}>
                              {allergen === 'Other' ? '🔧 Other (Custom)' : allergen}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Custom Allergen Input */}
                {showCustomAllergenInput && (
                  <View style={styles.customAllergenSection}>
                    <Text style={styles.customAllergenLabel}>Add Custom Allergen:</Text>
                    <View style={styles.customAllergenInputContainer}>
            <TextInput
                        style={styles.customAllergenInput}
                        placeholder="Enter custom allergen or restriction"
                        placeholderTextColor="#9CA3AF"
                        value={formData.customAllergen}
                        onChangeText={(text) => setFormData({ ...formData, customAllergen: text })}
                        maxLength={30}
                      />
                      <TouchableOpacity
                        style={styles.addCustomButton}
                        onPress={addCustomAllergen}
                        disabled={!formData.customAllergen.trim()}
                      >
                        <Text style={styles.addCustomButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Lifestyle Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Lifestyle & Dietary Preferences</Text>
            <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe lifestyle, diet preferences, or any additional notes (e.g., Vegan, Keto, Active lifestyle, Senior citizen)"
                  placeholderTextColor="#9CA3AF"
              value={formData.lifestyle}
              onChangeText={(text) => setFormData({ ...formData, lifestyle: text })}
              multiline
                  numberOfLines={3}
                  maxLength={200}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {formData.lifestyle.length}/200 characters
                </Text>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              {/* Delete Button - Only show for existing profiles that are not the root profile */}
              {editingProfile && user.profiles.length > 1 && (
                <TouchableOpacity
                  style={styles.deleteProfileButton}
                  onPress={() => handleDeleteProfile(editingProfile)}
                  disabled={isUpdating}
                >
                  <Text style={styles.deleteProfileButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  isUpdating && styles.disabledButton,
                  !formData.name.trim() && styles.disabledButton
                ]}
                onPress={() => {
                  console.log('🔴 Button pressed!');
                  console.log('📝 Current form name:', formData.name);
                  console.log('🔒 Button disabled:', isUpdating || !formData.name.trim());
                  handleSubmit();
                }}
                disabled={isUpdating || !formData.name.trim()}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdating ? (
                    <>Saving...</>
                  ) : editingProfile ? (
                    <>Update Profile</>
                  ) : (
                    <>Create Profile</>
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Compact Container
  compactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  compactHeader: {
    marginBottom: 16,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  compactListContent: {
    paddingRight: 8,
  },
  separator: {
    width: 12,
  },
  
  // Compact Profile Card
  compactProfileCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 80,
    position: 'relative',
  },
  compactProfileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactProfileAvatarText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '700',
  },
  compactProfileName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 12,
  },
  
  // Add Profile Card
  addProfileCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  addProfileContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProfileIcon: {
    fontSize: 24,
    color: '#0EA5E9',
    fontWeight: '700',
    marginBottom: 4,
  },
  addProfileText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Empty States
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIconText: {
    fontSize: 36,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Empty Profiles State
  emptyProfilesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyProfilesIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyProfilesIconText: {
    fontSize: 48,
  },
  emptyProfilesTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyProfilesSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstProfileButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  createFirstProfileButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  // Profiles List
  profilesList: {
    flex: 1,
  },
  profilesListContent: {
    padding: 24,
    paddingBottom: 100,
  },
  
  // Profile Cards
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  
  // Profile Details
  profileDetails: {
    gap: 16,
  },
  allergensSection: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  allergensSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F1D1D',
    marginBottom: 12,
  },
  allergensList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F87171',
  },
  allergenText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  noAllergensContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  noAllergensText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  lifestyleSection: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lifestyleSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  lifestyleText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
  },
  modalBody: {
    maxHeight: 400,
    paddingHorizontal: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  // Form Styles
  formGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  fieldHelper: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 6,
  },
  // Allergen Selection Styles
  selectedAllergensContainer: {
    marginBottom: 16,
  },
  selectedAllergensTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  selectedAllergensList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedAllergenTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  selectedAllergenText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
    marginRight: 8,
  },
  removeAllergenButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAllergenText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  // Allergen Dropdown Styles
  allergenDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  allergenDropdownContainer: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    maxHeight: 240,
  },
  dropdownHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  allergenDropdownScroll: {
    maxHeight: 200,
  },
  allergenDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  allergenDropdownItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  allergenItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergenCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  allergenCheckboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  allergenCheckboxCheck: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  allergenItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  allergenItemTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  // Custom Allergen Styles
  customAllergenSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customAllergenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  customAllergenInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  customAllergenInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
  },
  addCustomButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // Modal Action Buttons
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Modal Delete Button
  deleteProfileButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  deleteProfileButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 16,
  },
});
