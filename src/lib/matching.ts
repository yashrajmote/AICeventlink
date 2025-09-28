import { db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, orderBy, limit } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  interests: string[];
  isMentor: boolean;
  groupId: string | null;
  expLevel: number[]; // Array of expertise levels (1-10) for each interest
  groupSize: number;
  bio: string;
  skills: string[];
  goals: string[];
  networkingPreference: 'casual' | 'professional' | 'both';
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: UserProfile[];
  interests: string[];
  mentors: UserProfile[];
  groupSize: number;
  createdAt: Date;
  isActive: boolean;
}

// Matching algorithm based on top 2 interests
export const matchUsersByInterests = async (): Promise<void> => {
  try {
    // Fetch all users with null groupId
    const usersQuery = query(
      collection(db, 'profiles'),
      where('groupId', '==', null)
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserProfile[];

    if (users.length === 0) return;

    // Group users by their top 2 interests
    const interestGroups = new Map<string, UserProfile[]>();
    
    users.forEach(user => {
      const topInterests = user.interests.slice(0, 2);
      const interestKey = topInterests.sort().join('_');
      
      if (!interestGroups.has(interestKey)) {
        interestGroups.set(interestKey, []);
      }
      interestGroups.get(interestKey)!.push(user);
    });

    // Create groups from interest groups
    for (const [interestKey, groupUsers] of interestGroups) {
      await createOptimalGroups(groupUsers);
    }

    // Handle group size management
    await manageGroupSizes();

  } catch (error) {
    console.error('Error in matching algorithm:', error);
  }
};

// Create groups with optimal size (3-10 members)
const createOptimalGroups = async (users: UserProfile[]): Promise<void> => {
  const optimalGroupSize = 6;
  const groups: UserProfile[][] = [];
  
  // Split users into groups of optimal size
  for (let i = 0; i < users.length; i += optimalGroupSize) {
    const groupUsers = users.slice(i, i + optimalGroupSize);
    if (groupUsers.length >= 3) { // Minimum group size
      groups.push(groupUsers);
    }
  }

  // Handle remaining users (less than 3)
  const remainingUsers = users.slice(groups.length * optimalGroupSize);
  if (remainingUsers.length > 0) {
    // Try to merge with existing groups or create a small group
    if (remainingUsers.length >= 3) {
      groups.push(remainingUsers);
    } else {
      // Merge with the last group if it has space
      if (groups.length > 0 && groups[groups.length - 1].length < 10) {
        groups[groups.length - 1].push(...remainingUsers);
      }
    }
  }

  // Create group documents
  for (let i = 0; i < groups.length; i++) {
    const groupUsers = groups[i];
    const groupInterests = [...new Set(groupUsers.flatMap(u => u.interests.slice(0, 2)))];
    
    // Assign mentors
    const mentors = assignMentors(groupUsers);
    
    // Update users' groupId and isMentor status
    const groupId = `group_${Date.now()}_${i}`;
    
    for (const user of groupUsers) {
      await updateDoc(doc(db, 'profiles', user.uid), {
        groupId: groupId,
        isMentor: mentors.some(m => m.uid === user.uid),
        groupSize: groupUsers.length
      });
    }

    // Create group document
    const groupData = {
      id: groupId,
      name: `Group ${i + 1} - ${groupInterests.slice(0, 2).join(' & ')}`,
      description: `AI-matched group based on interests: ${groupInterests.join(', ')}`,
      members: groupUsers,
      interests: groupInterests,
      mentors: mentors,
      groupSize: groupUsers.length,
      createdAt: new Date(),
      isActive: true,
      isAIGenerated: true
    };

    await addDoc(collection(db, 'groups'), groupData);
  }
};

// Assign mentors based on expertise level
const assignMentors = (users: UserProfile[]): UserProfile[] => {
  // Calculate average expertise level for the group
  const avgExpLevel = users.reduce((sum, user) => {
    const maxExp = Math.max(...user.expLevel);
    return sum + maxExp;
  }, 0) / users.length;

  // Users with expertise above average become mentors
  const mentors = users.filter(user => {
    const maxExp = Math.max(...user.expLevel);
    return maxExp > avgExpLevel;
  });

  // If no mentors, flag the group (we'll handle this separately)
  if (mentors.length === 0) {
    console.warn('Group has no mentors - needs flagging');
  }

  return mentors;
};

// Manage group sizes (split large groups, merge small ones)
const manageGroupSizes = async (): Promise<void> => {
  try {
    // Get all active groups
    const groupsQuery = query(
      collection(db, 'groups'),
      where('isActive', '==', true)
    );
    const groupsSnapshot = await getDocs(groupsQuery);
    
    const groups = groupsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Group[];

    for (const group of groups) {
      // Split groups larger than 10
      if (group.groupSize > 10) {
        await splitGroup(group);
      }
      // Merge groups smaller than 3
      else if (group.groupSize < 3) {
        await mergeGroup(group);
      }
    }
  } catch (error) {
    console.error('Error managing group sizes:', error);
  }
};

// Split large groups
const splitGroup = async (group: Group): Promise<void> => {
  const midPoint = Math.floor(group.members.length / 2);
  const group1Members = group.members.slice(0, midPoint);
  const group2Members = group.members.slice(midPoint);

  // Create two new groups
  const group1Id = `group_${Date.now()}_split1`;
  const group2Id = `group_${Date.now()}_split2`;

  // Update members' groupId
  for (const member of group1Members) {
    await updateDoc(doc(db, 'profiles', member.uid), {
      groupId: group1Id,
      groupSize: group1Members.length
    });
  }

  for (const member of group2Members) {
    await updateDoc(doc(db, 'profiles', member.uid), {
      groupId: group2Id,
      groupSize: group2Members.length
    });
  }

  // Create new group documents
  const group1Data = {
    ...group,
    id: group1Id,
    name: `${group.name} - Part 1`,
    members: group1Members,
    groupSize: group1Members.length,
    mentors: assignMentors(group1Members)
  };

  const group2Data = {
    ...group,
    id: group2Id,
    name: `${group.name} - Part 2`,
    members: group2Members,
    groupSize: group2Members.length,
    mentors: assignMentors(group2Members)
  };

  await addDoc(collection(db, 'groups'), group1Data);
  await addDoc(collection(db, 'groups'), group2Data);

  // Deactivate original group
  await updateDoc(doc(db, 'groups', group.id), {
    isActive: false,
    reason: 'Split due to size'
  });
};

// Merge small groups
const mergeGroup = async (group: Group): Promise<void> => {
  try {
    // Find another small group with similar interests
    const similarGroupsQuery = query(
      collection(db, 'groups'),
      where('isActive', '==', true),
      where('groupSize', '<', 6)
    );
    const similarGroupsSnapshot = await getDocs(similarGroupsQuery);
    
    const similarGroups = similarGroupsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Group[];

    // Find best match based on shared interests
    let bestMatch: Group | null = null;
    let maxSharedInterests = 0;

    for (const candidateGroup of similarGroups) {
      if (candidateGroup.id === group.id) continue;
      
      const sharedInterests = group.interests.filter(interest => 
        candidateGroup.interests.includes(interest)
      ).length;

      if (sharedInterests > maxSharedInterests) {
        maxSharedInterests = sharedInterests;
        bestMatch = candidateGroup;
      }
    }

    if (bestMatch && group.groupSize + bestMatch.groupSize <= 10) {
      await mergeTwoGroups(group, bestMatch);
    }
  } catch (error) {
    console.error('Error merging group:', error);
  }
};

// Merge two groups
const mergeTwoGroups = async (group1: Group, group2: Group): Promise<void> => {
  const mergedId = `group_${Date.now()}_merged`;
  const mergedMembers = [...group1.members, ...group2.members];
  const mergedInterests = [...new Set([...group1.interests, ...group2.interests])];

  // Update all members' groupId
  for (const member of mergedMembers) {
    await updateDoc(doc(db, 'profiles', member.uid), {
      groupId: mergedId,
      groupSize: mergedMembers.length
    });
  }

  // Create merged group
  const mergedGroupData = {
    id: mergedId,
    name: `Merged Group - ${mergedInterests.slice(0, 2).join(' & ')}`,
    description: `Merged group combining ${group1.name} and ${group2.name}`,
    members: mergedMembers,
    interests: mergedInterests,
    mentors: assignMentors(mergedMembers),
    groupSize: mergedMembers.length,
    createdAt: new Date(),
    isActive: true,
    isAIGenerated: true
  };

  await addDoc(collection(db, 'groups'), mergedGroupData);

  // Deactivate original groups
  await updateDoc(doc(db, 'groups', group1.id), {
    isActive: false,
    reason: 'Merged due to small size'
  });
  await updateDoc(doc(db, 'groups', group2.id), {
    isActive: false,
    reason: 'Merged due to small size'
  });
};

// Legacy functions for backward compatibility
export const calculateMatchingScore = (user1: UserProfile, user2: UserProfile): any => {
  // Simplified for new schema
  const commonInterests = user1.interests.filter(interest => 
    user2.interests.includes(interest)
  );
  return {
    userId: user2.uid,
    score: commonInterests.length * 10,
    reasons: [`Shared interests: ${commonInterests.join(', ')}`]
  };
};

export const findBestMatches = async (userId: string, eventId: string, limit: number = 5): Promise<UserProfile[]> => {
  // This function is now handled by the main matching algorithm
  return [];
};

export const createOptimalGroups = async (eventId: string, groupSize: number = 6): Promise<void> => {
  // This function is now handled by the main matching algorithm
  await matchUsersByInterests();
};