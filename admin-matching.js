// Admin function to trigger matching algorithm
// Run this in browser console after users have completed profiles

const triggerMatching = async () => {
  const { matchUsersByInterests } = await import('./src/lib/matching');
  
  try {
    console.log('🔄 Starting matching algorithm...');
    await matchUsersByInterests();
    console.log('✅ Matching algorithm completed!');
  } catch (error) {
    console.error('❌ Error in matching algorithm:', error);
  }
};

// Instructions for testing the complete flow:
console.log(`
🎯 COMPLETE TESTING FLOW:

1. Create multiple user accounts:
   - User 1: Interests: [Technology, AI/ML], Experience: Expert
   - User 2: Interests: [Technology, Web Development], Experience: Intermediate  
   - User 3: Interests: [AI/ML, Data Science], Experience: Beginner
   - User 4: Interests: [Web Development, Design], Experience: Expert

2. Complete profiles for all users

3. Run matching algorithm:
   triggerMatching()

4. Check groups in Firebase Console or My Groups page

📊 EXPECTED RESULTS:
- Users grouped by top 2 interests
- Mentors assigned based on expertise level
- Group sizes managed (3-10 members)
- Groups split if >10, merged if <3

🔍 DATABASE STRUCTURE:
- profiles collection: uid, name, interests, isMentor, groupId, expLevel, groupSize
- groups collection: id, name, members, mentors, interests, groupSize
- matching_queue collection: userId, timestamp, status

🚀 Ready to test? Run: triggerMatching()
`);

// Uncomment to automatically trigger matching
// triggerMatching();
