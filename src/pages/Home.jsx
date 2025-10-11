import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
		name: 'Media Tools',
		id: 'media',
		tools: [
			{ name: 'Audio Trimmer & Joiner', icon: 'Music' },
			{ name: 'Image Converter', icon: 'Image' },
			{ name: 'Image Resizer & Cropper', icon: 'Crop' },
			{ name: 'Text to Speech', icon: 'Volume2' },
			{ name: 'Video Compressor', icon: 'Video' },
			{ name: 'Screen Recorder', icon: 'MonitorPlay' },
		],
	},
	{
		name: 'PDF & Image Tools',
		id: 'pdf',
		tools: [
			{ name: 'PDF Merger', icon: 'FileText' },
			{ name: 'PDF Splitter', icon: 'FileText' },
			{ name: 'PDF Compressor', icon: 'FileText' },
			{ name: 'Image to PDF', icon: 'FileImage' },
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
			{ name: 'Daily Goal Dashboard', icon: 'Target' },
			{ name: 'Habit Tracker', icon: 'TrendingUp' },
			{ name: 'Reading Mode', icon: 'BookOpen' },
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
			{ name: 'System Info Dashboard', icon: 'Activity' },
		],
	},
	{
		name: 'Security & Privacy',
		id: 'security',
		tools: [
			{ name: 'File Locker', icon: 'Shield' },
			{ name: 'Two-Layer Vault', icon: 'ShieldCheck' },
			{ name: 'Clipboard Privacy Mode', icon: 'EyeOff' },
			{ name: 'Secure Notes', icon: 'Lock' },
		],
	},
];

function Home() {
	const { category } = useParams();
	const [favorites, setFavorites] = useState(() => {
		const saved = localStorage.getItem('mura-favorites');
		return saved ? JSON.parse(saved) : [];
	});
	
	useEffect(() => {
		localStorage.setItem('mura-favorites', JSON.stringify(favorites));
	}, [favorites]);

	const handleToolClick = (toolName) => {
		const toolId = toolName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
		if (window.electronAPI) {
			window.electronAPI.openToolWindow(toolId);
		} else {
			// Fallback for development without Electron
			window.open(`#/tool/${toolId}`, '_blank', 'width=800,height=600');
		}
	};

	const toggleFavorite = (e, toolName) => {
		e.stopPropagation(); // Prevent tool from opening
		setFavorites(prev => {
			if (prev.includes(toolName)) {
				return prev.filter(name => name !== toolName);
			} else {
				return [...prev, toolName];
			}
		});
	};

	const isFavorite = (toolName) => favorites.includes(toolName);

	// Get all favorite tools
	const favoriteTools = toolCategories
		.flatMap(cat => cat.tools.map(tool => ({ ...tool, category: cat.name })))
		.filter(tool => favorites.includes(tool.name));

	// Filter categories based on route parameter
	const filteredCategories = category 
		? toolCategories.filter(cat => cat.id === category)
		: toolCategories;

	console.log('Home component rendering, category:', category, 'filtered:', filteredCategories.length);

	const renderToolCard = (tool, index) => {
		const Icon = Icons[tool.icon] || Icons.Wrench;
		const favorite = isFavorite(tool.name);
		
		return (
			<motion.div
				key={tool.name}
				className="relative"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: index * 0.05 }}
			>
				<motion.button
					onClick={() => handleToolClick(tool.name)}
					className="w-full flex flex-col items-center justify-center bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 cursor-pointer p-6"
					style={{ minHeight: 120 }}
					whileHover={{ 
						scale: 1.03, 
						y: -4,
						boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
					}}
					whileTap={{ scale: 0.98 }}
					transition={{ duration: 0.2 }}
				>
					<Icon className="w-8 h-8 mb-2 text-emerald-600 dark:text-emerald-400" />
					<span className="text-base font-medium text-zinc-800 dark:text-zinc-100">
						{tool.name}
					</span>
				</motion.button>
				<motion.button
					onClick={(e) => toggleFavorite(e, tool.name)}
					className="absolute top-2 right-2 p-2 rounded-lg bg-white dark:bg-zinc-700 shadow-md z-10"
					title={favorite ? 'Remove from favorites' : 'Add to favorites'}
					whileHover={{ scale: 1.15 }}
					whileTap={{ scale: 0.9 }}
					transition={{ duration: 0.2 }}
				>
					<motion.div
						initial={false}
						animate={{ scale: favorite ? [1, 1.2, 1] : 1 }}
						transition={{ duration: 0.3 }}
					>
						<Icons.Heart
							className={`w-5 h-5 transition-colors ${
								favorite 
									? 'fill-red-500 text-red-500' 
									: 'text-zinc-400 dark:text-zinc-500'
							}`}
						/>
					</motion.div>
				</motion.button>
			</motion.div>
		);
	};

	return (
		<div className="space-y-10">
			{/* Favorites Section */}
			{!category && favoriteTools.length > 0 && (
				<motion.section
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
						<Icons.Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
						Favorite Tools
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{favoriteTools.map((tool, index) => renderToolCard(tool, index))}
					</div>
				</motion.section>
			)}

			{/* Regular Categories */}
			{filteredCategories.length === 0 ? (
				<motion.div 
					className="text-center py-12"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4 }}
				>
					<p className="text-zinc-500 dark:text-zinc-400 text-lg">Category not found</p>
				</motion.div>
			) : (
				filteredCategories.map((cat) => (
					<motion.section
						key={cat.name}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
							{cat.name}
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{cat.tools.map((tool, index) => renderToolCard(tool, index))}
						</div>
					</motion.section>
				))
			)}
		</div>
	);
}

export default Home;