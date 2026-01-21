import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGroupByCode, getBacteriaInGroup, getClinicalRelevancy } from '@/lib/data';

export async function generateMetadata({ params }) {
  const { groupId } = await params;
  const decodedGroupId = decodeURIComponent(groupId);
  const group = getGroupByCode(decodedGroupId);

  if (!group) {
    return { title: 'Group Not Found' };
  }

  return {
    title: `${group.mo_group_name} - Bacteria Search`,
    description: `${group.member_count} bacteria in the ${group.mo_group_name} group`
  };
}

export default async function GroupDetailPage({ params }) {
  const { groupId } = await params;
  const decodedGroupId = decodeURIComponent(groupId);
  const group = getGroupByCode(decodedGroupId);

  if (!group) {
    notFound();
  }

  const members = getBacteriaInGroup(decodedGroupId);

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        &larr; Back to Search
      </Link>

      <header className="bacteria-header">
        <div className="header-main">
          <h1 className="bacteria-title" style={{ fontStyle: 'normal' }}>{group.mo_group_name}</h1>
          <span className="group-count-badge">
            {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
          </span>
        </div>
        <div className="bacteria-subtitle">
          <span className="mo-code">Group: {group.mo_group}</span>
        </div>
      </header>

      <section className="detail-section">
        <h2>Members</h2>
        <p className="section-description">
          Bacteria belonging to this group.
        </p>
        <div className="group-members-list">
          {members.map((member) => {
            const relevancy = getClinicalRelevancy(member.bacteria?.prevalence);
            return (
              <Link
                key={member.mo}
                href={`/bacteria/${encodeURIComponent(member.mo)}`}
                className="group-member-card"
              >
                <div className="member-info">
                  <span className="member-name">{member.mo_name}</span>
                  <span className="member-code">{member.mo}</span>
                </div>
                <span className={`relevancy-badge relevancy-${relevancy.level}`}>
                  {relevancy.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
