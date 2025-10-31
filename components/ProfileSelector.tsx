import React, { useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

// Color palette for profile avatars (matching ProfileManager)
const PROFILE_COLORS = [
  '#D9F0FF', // Light Blue
  '#A3D5FF', // Medium Blue
  '#83C9F4', // Sky Blue
  '#6F73D2', // Purple Blue
  '#7681B3', // Blue Gray
];

// Get consistent color for profile
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
  conditions?: string[];
  lifestyle?: string;
}

interface ProfileSelectorProps {
  onProfileSelect: (profile: Profile | null, color: string) => void;
  selectedProfile?: Profile | null;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  onProfileSelect,
  selectedProfile,
}) => {
  const { user } = useAuth();
  const profiles = user?.profiles || [];
  const data = [...profiles, 'add'] as (Profile | 'add')[];

  const handleSelectProfile = (profile: Profile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const color = getProfileColor(profile.name);
    onProfileSelect(profile, color);
  };

  const renderProfileItem = ({ item, index }: { item: Profile | 'add'; index: number }) => {
    if (item === 'add') {
      return (
        <TouchableOpacity style={styles.addProfileCard} onPress={() => onProfileSelect(null, '#83C9F4')}>
          <View style={styles.addProfileContent}>
            <Text style={styles.addProfileIcon}>+</Text>
            <Text style={styles.addProfileText}>Add</Text>
          </View>
        </TouchableOpacity>
      );
    }

    const profile = item as Profile;
    const isSelected = selectedProfile?._id === profile._id;
    const profileColor = getProfileColor(profile.name);
    const initials = profile.name.substring(0, 2).toUpperCase();

    return (
      <TouchableOpacity
        style={[
          styles.profileCard,
          isSelected && styles.selectedProfileCard,
        ]}
        onPress={() => handleSelectProfile(profile)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: profileColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.profileName, isSelected && styles.selectedText]} numberOfLines={1}>
          {profile.name}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {profiles.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderProfileItem}
          keyExtractor={(item, index) => item === 'add' ? 'add' : (item as Profile)._id || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          snapToInterval={112} // 100px card + 12px separator
          decelerationRate="fast"
          snapToAlignment="start"
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No profiles found</Text>
          <Text style={styles.emptyStateSubtext}>
            Create a profile in the Profile tab first
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  separator: {
    width: 12,
  },
  
  // Profile Cards
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 100,
    position: 'relative',
  },
  selectedProfileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Add Profile Card
  addProfileCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  addProfileContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProfileIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 6,
  },
  addProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});