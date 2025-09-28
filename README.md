# AICeventlink - AI-Powered Event Networking Platform

A comprehensive web application built for IRL events that revolutionizes how attendees connect, network, and collaborate. Built with Next.js, Firebase, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Smart Check-In System**: Automatic check-in using QR codes or location-based detection
- **AI-Powered Matching**: Intelligent pairing of attendees based on interests, skills, and goals
- **Dynamic Group Management**: Join groups freely and switch between them without restrictions
- **Real-Time Chat**: Instant messaging system for group communication
- **Q&A Sessions**: Interactive question and answer system with voting
- **Live Captioning**: Accessibility-first live speech-to-text for all sessions
- **Admin Dashboard**: Comprehensive management tools for event organizers

### Key Benefits
- **No Hassle for Organizers**: Automatic check-ins eliminate manual processes
- **Meaningful Connections**: AI matching ensures relevant networking opportunities
- **Flexible Networking**: Users can freely change groups and explore different connections
- **Accessibility**: Live captions make events inclusive for all attendees
- **Real-Time Engagement**: Instant chat and Q&A keep attendees engaged

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Real-time**: Firebase Firestore real-time listeners
- **Speech Recognition**: Web Speech API
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── captions/          # Live captioning
│   ├── chat/              # Real-time chat
│   ├── checkin/           # Event check-in
│   ├── mygroup/           # Group management
│   ├── profile-setup/     # User profile creation
│   ├── qa/                # Q&A sessions
│   └── notes/             # Shared notes
├── components/            # Reusable React components
├── context/              # React context providers
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   └── matching.ts       # AI matching algorithms
└── pages/                # Legacy page components
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AICeventlink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Update `src/lib/firebase.ts` with your config

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage Flow

### For Attendees
1. **Profile Setup**: Complete your profile with interests, skills, and goals
2. **Event Check-In**: Scan QR code or use location-based check-in
3. **Group Matching**: Get automatically matched with like-minded attendees
4. **Networking**: Join groups, chat, ask questions, and collaborate
5. **Accessibility**: Use live captions for better event experience

### For Organizers
1. **Admin Dashboard**: Create and manage events
2. **Attendee Management**: Monitor check-ins and group formations
3. **Analytics**: Track engagement and networking success
4. **Q&A Moderation**: Answer questions and moderate discussions

## 🔧 Configuration

### Firebase Collections
- `profiles`: User profiles and preferences
- `events`: Event information and settings
- `groups`: Group data and member lists
- `checkins`: Check-in records
- `messages`: Chat messages
- `questions`: Q&A questions and answers
- `captions`: Live caption data

### Environment Variables
Create a `.env.local` file with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## 🎯 Key Features Explained

### AI Matching Algorithm
The matching system considers:
- **Interests** (40% weight): Shared topics and passions
- **Goals** (30% weight): Common objectives and aspirations
- **Skills** (20% weight): Complementary expertise
- **Experience Level** (10% weight): Similar career stages

### Real-Time Features
- **Chat**: Instant messaging with Firebase Firestore
- **Q&A**: Live question submission and voting
- **Captions**: Real-time speech-to-text using Web Speech API
- **Group Updates**: Dynamic group membership changes

### Accessibility Features
- **Live Captions**: High-contrast display with timestamps
- **Responsive Design**: Mobile-first approach
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML structure

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Hackathon Project

Built for F1 Hackathon - AICeventlink represents the future of IRL event networking, combining AI-powered matching with seamless user experience to create meaningful connections at events.

---

**Built with ❤️ for better event experiences**