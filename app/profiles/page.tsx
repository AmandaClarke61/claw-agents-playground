import { connectDB } from '@/lib/db/mongodb';
import Profile from '@/lib/models/Profile';
import ProfileList from './ProfileList';

export const dynamic = 'force-dynamic';

async function getProfiles() {
    await connectDB();
    const profiles = await Profile.find({}).sort({ createdAt: 1 }).limit(50).lean();
    return JSON.parse(JSON.stringify(profiles));
}

export default async function ProfilesPage() {
    const profiles = await getProfiles();

    return (
        <div className="container" style={{ paddingBottom: 80 }}>
            <ProfileList profiles={profiles} />
        </div>
    );
}
