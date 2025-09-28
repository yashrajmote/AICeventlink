# AICeventlink

AI-powered event management platform for seamless collaboration and organization.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AICeventlink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Go to Project Settings > General > Your apps
   - Add a new web app and copy the config
   - Replace the placeholder values in `src/lib/firebase.ts`:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-actual-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-actual-sender-id",
     appId: "your-actual-app-id"
   };
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin page route
│   ├── mygroup/           # My Group page route
│   ├── notes/             # Notes page route
│   ├── profile/           # Profile page route
│   ├── layout.tsx         # Root layout with navbar
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── GroupCard.tsx      # Group card component
│   ├── Navbar.tsx         # Navigation component
│   ├── NotesPage.tsx      # Notes upload component
│   └── ProfileForm.tsx    # Profile form component
├── lib/                   # Utility libraries
│   └── firebase.ts        # Firebase configuration
└── pages/                 # Page components
    ├── Admin.tsx          # Admin page component
    ├── Home.tsx           # Home page component
    ├── MyGroup.tsx        # My Group page component
    ├── Notes.tsx          # Notes page component
    └── Profile.tsx        # Profile page component
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (configured but not implemented)
- **Deployment**: Vercel

## 🎯 Features (Placeholder)

- **Home Page**: Welcome and overview
- **Profile Management**: User profile form
- **Group Management**: Create and manage groups
- **Notes Upload**: File upload interface
- **Admin Panel**: Administrative controls

## 🚀 Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables for Firebase (if needed)
   - Deploy!

3. **Environment Variables** (if using Firebase)
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- Prettier for code formatting (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Notes

- This is a scaffold project for hackathon development
- All components are placeholder implementations
- Firebase is configured but authentication and Firestore are not implemented
- Ready for team collaboration and feature development

## 🔧 Troubleshooting

### Common Issues

1. **Firebase not working**: Check your API keys in `src/lib/firebase.ts`
2. **Build errors**: Run `npm run lint` to check for TypeScript errors
3. **Styling issues**: Ensure Tailwind CSS is properly configured

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Tailwind CSS documentation](https://tailwindcss.com/docs)
- Check the [Firebase documentation](https://firebase.google.com/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🎉**