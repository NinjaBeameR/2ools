import React from 'react';
import { useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';

const toolCategories = [
	{
		name: 'General Tools',
		id: 'general',
		tools: [
			{ name: 'Calculator', icon: 'Calculator' },
			{ name: 'Unit Converter', icon: 'ArrowRightLeft' },
			{ name: 'Clipboard Manager', icon: 'Clipboard' },
			{ name: 'QR Code Generator', icon: 'QrCode' },
			{ name: 'Text Formatter', icon: 'Type' },
			{ name: 'Password Generator', icon: 'Lock' },
		],
	},
	{
		name: 'PDF & Image Tools',
		id: 'pdf',
		tools: [
			{ name: 'PDF Merger', icon: 'FileText' },
			{ name: 'PDF Splitter', icon: 'FileText' },
			{ name: 'PDF Compressor', icon: 'FileText' },
			{ name: 'Image Converter', icon: 'Image' },
			{ name: 'Image Resizer & Cropper', icon: 'Crop' },
		],
	},
	{
		name: 'Productivity Tools',
		id: 'productivity',
		tools: [
			{ name: 'To-Do List', icon: 'CheckSquare' },
			{ name: 'Notes', icon: 'StickyNote' },
			{ name: 'Pomodoro Timer', icon: 'Timer' },
			{ name: 'Reminder Alerts', icon: 'Bell' },
			{ name: 'Daily Journal', icon: 'BookOpen' },
		],
	},
	{
		name: 'File & System Tools',
		id: 'file',
		tools: [
			{ name: 'Duplicate File Finder', icon: 'Search' },
			{ name: 'File Organizer', icon: 'Folder' },
			{ name: 'Temporary File Cleaner', icon: 'Trash2' },
			{ name: 'Disk Space Analyzer', icon: 'HardDrive' },
			{ name: 'Startup Program Manager', icon: 'PlayCircle' },
		],
	},
	{
		name: 'Security & Privacy',
		id: 'security',
		tools: [
			{ name: 'File Locker', icon: 'Shield' },
			{ name: 'Clipboard Privacy Mode', icon: 'EyeOff' },
			{ name: 'Secure Notes', icon: 'Lock' },
		],
	},
];

function Home() {
	const { category } = useParams();
	
	const handleToolClick = (toolName) => {
		const toolId = toolName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
		if (window.electronAPI) {
			window.electronAPI.openToolWindow(toolId);
		} else {
			// Fallback for development without Electron
			window.open(`#/tool/${toolId}`, '_blank', 'width=800,height=600');
		}
	};

	// Filter categories based on route parameter
	const filteredCategories = category 
		? toolCategories.filter(cat => cat.id === category)
		: toolCategories;

	console.log('Home component rendering, category:', category, 'filtered:', filteredCategories.length);

	return (
		<div className="space-y-10">
			{filteredCategories.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-zinc-500 dark:text-zinc-400 text-lg">Category not found</p>
				</div>
			) : (
				filteredCategories.map((cat) => (
					<section key={cat.name}>
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
							{cat.name}
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{cat.tools.map((tool) => {
								const Icon = Icons[tool.icon] || Icons.Wrench;
								return (
									<button
										key={tool.name}
										onClick={() => handleToolClick(tool.name)}
										className="flex flex-col items-center justify-center bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-emerald-500/40 hover:-translate-y-1 hover:ring-2 hover:ring-emerald-400 transition-all p-6 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
										style={{ minHeight: 120 }}
									>
										<Icon className="w-8 h-8 mb-2 text-emerald-600 dark:text-emerald-400" />
										<span className="text-base font-medium text-zinc-800 dark:text-zinc-100">
											{tool.name}
										</span>
									</button>
								);
							})}
						</div>
					</section>
				))
			)}
		</div>
	);
}

export default Home;