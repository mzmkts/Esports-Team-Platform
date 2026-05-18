import Link from 'next/link';

export default function TeamCard({ team, onJoin, userId }) {
    const isMember = team.members?.some(m => m._id === userId || m === userId);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-cyan-500/50 transition">
            <div>
                <div className="flex items-center gap-3 mb-3">
                    {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-full object-cover bg-slate-800" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400 font-bold">
                            {team.name[0]}
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">{team.name}</h3>
                        <span className="text-xs bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-mono uppercase">
                            {team.game || 'Дисциплина'}
                        </span>
                    </div>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{team.description}</p>
                <div className="text-xs text-slate-500 mb-4">
                    Участники: <span className="text-slate-300">{team.members?.length} / {team.maxMembers || 5}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Link href={`/teams/${team._id}`} className="flex-1 text-center bg-slate-800 hover:bg-slate-700 py-2 rounded text-sm transition">
                    Комната чата
                </Link>
                {onJoin && !isMember && (
                    <button
                        onClick={() => onJoin(team._id)}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded text-sm transition"
                    >
                        Вступить
                    </button>
                )}
            </div>
        </div>
    );
}