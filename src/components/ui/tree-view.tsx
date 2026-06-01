'use client';

import React, { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, FileCode, File, FileJson, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TreeItem {
  id: string;
  label: string;
  type: 'folder' | 'file';
  fileType?: 'ts' | 'json' | 'md' | 'css';
  children?: TreeItem[];
}

interface TreeViewProps {
  data: TreeItem[];
  className?: string;
}

const FileIcon = ({ type, fileType }: { type: TreeItem['type']; fileType?: TreeItem['fileType'] }) => {
  if (type === 'folder') return null;
  switch (fileType) {
    case 'ts': return <FileCode className="h-4 w-4 text-blue-500" />;
    case 'json': return <FileJson className="h-4 w-4 text-orange-500" />;
    case 'md': return <FileText className="h-4 w-4 text-gray-500" />;
    default: return <File className="h-4 w-4 text-muted-foreground" />;
  }
};

const TreeNode = ({ item, depth }: { item: TreeItem; depth: number }) => {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
          "hover:bg-primary/5 group",
          depth > 0 && "ml-4"
        )}
      >
        {hasChildren && (
          <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", isOpen && "rotate-90")} />
        )}
        {!hasChildren && <span className="w-3" />}
        {item.type === 'folder' ? (
          isOpen ? <FolderOpen className="h-4 w-4 text-yellow-500" /> : <Folder className="h-4 w-4 text-yellow-500" />
        ) : (
          <FileIcon type={item.type} fileType={item.fileType} />
        )}
        <span className={cn("font-medium text-foreground/80 group-hover:text-primary transition-colors")}>
          {item.label}
        </span>
      </div>
      
      {hasChildren && isOpen && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
          {item.children!.map((child) => (
            <TreeNode key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function TreeView({ data, className }: TreeViewProps) {
  return (
    <div className={cn("neu-inset rounded-2xl p-4 bg-transparent", className)}>
      <div className="space-y-1">
        {data.map((item) => (
          <TreeNode key={item.id} item={item} depth={0} />
        ))}
      </div>
    </div>
  );
}