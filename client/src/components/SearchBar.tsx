import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2, User, FileText, HelpCircle, BookOpen, Filter, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  type: "coach" | "course" | "page" | "faq";
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  metadata?: {
    category?: string;
    level?: string;
    sleLevel?: string;
    price?: number;
    priceFormatted?: string;
    totalModules?: number;
    totalLessons?: number;
    duration?: number;
    durationFormatted?: string;
    rating?: string | number;
    enrollments?: number;
    instructor?: string;
    languages?: string;
    specializations?: Record<string, boolean>;
  };
  score: number;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  autoFocus?: boolean;
  variant?: "default" | "header" | "modal";
  showFilters?: boolean;
}

type CourseLevel = "beginner" | "intermediate" | "advanced" | "all_levels";
type CourseCategory = "sle_oral" | "sle_written" | "sle_reading" | "sle_complete" | "exam_prep" | "grammar" | "vocabulary";

const typeIcons = {
  coach: User,
  course: BookOpen,
  page: FileText,
  faq: HelpCircle,
};

const typeLabels = {
  coach: "Coach",
  course: "Course",
  page: "Page",
  faq: "FAQ",
};

// SLE Level filters (A, B, C mapping)
const levelFilters: { value: CourseLevel; label: string; sleLevel: string }[] = [
  { value: "beginner", label: "Level A", sleLevel: "A" },
  { value: "intermediate", label: "Level B", sleLevel: "B" },
  { value: "advanced", label: "Level C", sleLevel: "C" },
  { value: "all_levels", label: "All Levels", sleLevel: "All" },
];

// Category filters
const categoryFilters: { value: CourseCategory; label: string }[] = [
  { value: "sle_oral", label: "Oral" },
  { value: "sle_written", label: "Written" },
  { value: "sle_reading", label: "Reading" },
  { value: "sle_complete", label: "Complete" },
  { value: "exam_prep", label: "Exam Prep" },
  { value: "grammar", label: "Grammar" },
  { value: "vocabulary", label: "Vocabulary" },
];

export function SearchBar({
  className,
  placeholder = "Search coaches, courses, pages...",
  onClose,
  autoFocus = false,
  variant = "default",
  showFilters = true,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<CourseLevel[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CourseCategory[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  
  const debouncedQuery = useDebounce(query, 300);
  
  // Build search filters
  const searchFilters = {
    query: debouncedQuery,
    limit: 15,
    courseLevel: selectedLevels.length > 0 ? selectedLevels : undefined,
    courseCategory: selectedCategories.length > 0 ? selectedCategories : undefined,
    freeOnly: freeOnly || undefined,
  };
  
  // Search query
  const { data: searchResults, isLoading } = trpc.search.query.useQuery(
    searchFilters,
    { enabled: debouncedQuery.length >= 2 }
  );
  
  const results = searchResults?.results || [];
  const suggestions = searchResults?.suggestions || [];
  
  // Toggle level filter
  const toggleLevel = (level: CourseLevel) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };
  
  // Toggle category filter
  const toggleCategory = (category: CourseCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedLevels([]);
    setSelectedCategories([]);
    setFreeOnly(false);
  };
  
  const hasActiveFilters = selectedLevels.length > 0 || selectedCategories.length > 0 || freeOnly;
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToResult(results[selectedIndex] as SearchResult);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setShowFilterPanel(false);
        onClose?.();
        break;
    }
  }, [isOpen, results, selectedIndex, onClose]);
  
  // Navigate to result
  const navigateToResult = (result: SearchResult) => {
    setLocation(result.url);
    setQuery("");
    setIsOpen(false);
    setShowFilterPanel(false);
    onClose?.();
  };
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowFilterPanel(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Open dropdown when typing
  useEffect(() => {
    if (query.length >= 2) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [query]);
  
  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  const variantStyles = {
    default: "w-full max-w-md",
    header: "w-64 lg:w-80",
    modal: "w-full",
  };
  
  // Render course metadata badges
  const renderCourseMetadata = (result: SearchResult) => {
    if (result.type !== "course" || !result.metadata) return null;
    
    const { sleLevel, priceFormatted, durationFormatted, enrollments } = result.metadata;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {sleLevel && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            <GraduationCap className="h-2.5 w-2.5 mr-0.5" />
            {sleLevel}
          </Badge>
        )}
        {priceFormatted && (
          <Badge variant={priceFormatted === "Free" ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
            {priceFormatted}
          </Badge>
        )}
        {durationFormatted && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {durationFormatted}
          </Badge>
        )}
        {enrollments && enrollments > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {enrollments} enrolled
          </Badge>
        )}
      </div>
    );
  };
  
  return (
    <div className={cn("relative", variantStyles[variant], className)}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            className={cn(
              "pl-10 pr-10",
              variant === "header" && "h-9 bg-muted/50",
              variant === "modal" && "h-12 text-lg"
            )}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        {/* Filter button - only show in modal variant */}
        {showFilters && variant === "modal" && (
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-12 w-12 flex-shrink-0",
              hasActiveFilters && "bg-[#C65A1E] hover:bg-amber-600"
            )}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Filter className="h-5 w-5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {selectedLevels.length + selectedCategories.length + (freeOnly ? 1 : 0)}
              </span>
            )}
          </Button>
        )}
      </div>
      
      {/* Filter panel */}
      {showFilterPanel && variant === "modal" && (
        <div className="mt-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Filter Courses</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                Clear all
              </Button>
            )}
          </div>
          
          {/* Level filters */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">SLE Level</p>
            <div className="flex flex-wrap gap-2">
              {levelFilters.map(({ value, label, sleLevel }) => (
                <Button
                  key={value}
                  variant={selectedLevels.includes(value) ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    selectedLevels.includes(value) && "bg-teal-600 hover:bg-teal-700"
                  )}
                  onClick={() => toggleLevel(value)}
                >
                  {sleLevel === "All" ? label : `Level ${sleLevel}`}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Category filters */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={selectedCategories.includes(value) ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    selectedCategories.includes(value) && "bg-[#C65A1E] hover:bg-amber-600"
                  )}
                  onClick={() => toggleCategory(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Free only toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={freeOnly ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-xs",
                freeOnly && "bg-green-600 hover:bg-green-700"
              )}
              onClick={() => setFreeOnly(!freeOnly)}
            >
              Free courses only
            </Button>
          </div>
        </div>
      )}
      
      {/* Active filters display (compact) */}
      {hasActiveFilters && variant === "modal" && !showFilterPanel && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedLevels.map(level => {
            const filter = levelFilters.find(f => f.value === level);
            return (
              <Badge
                key={level}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleLevel(level)}
              >
                Level {filter?.sleLevel} <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
          {selectedCategories.map(category => {
            const filter = categoryFilters.find(f => f.value === category);
            return (
              <Badge
                key={category}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleCategory(category)}
              >
                {filter?.label} <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
          {freeOnly && (
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setFreeOnly(false)}
            >
              Free only <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
      
      {/* Results dropdown */}
      {isOpen && (
        <div
          ref={resultsRef}
          className={cn(
            "absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden",
            variant === "modal" && "max-h-[60vh]",
            variant !== "modal" && "max-h-[400px]"
          )}
        >
          {results.length > 0 ? (
            <div className="overflow-y-auto">
              {/* Group results by type */}
              {["coach", "course", "page", "faq"].map((type) => {
                const typeResults = results.filter(r => r.type === type);
                if (typeResults.length === 0) return null;
                
                const Icon = typeIcons[type as keyof typeof typeIcons];
                
                return (
                  <div key={type}>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                      {typeLabels[type as keyof typeof typeLabels]}s
                      {type === "course" && typeResults.length > 0 && (
                        <span className="ml-2 text-amber-600">({typeResults.length})</span>
                      )}
                    </div>
                    {typeResults.map((result) => {
                      const globalIndex = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          className={cn(
                            "w-full px-3 py-2 flex items-start gap-3 hover:bg-accent text-left transition-colors",
                            selectedIndex === globalIndex && "bg-accent"
                          )}
                          onClick={() => navigateToResult(result as SearchResult)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          {result.imageUrl ? (
                            <img
                              loading="lazy" src={result.imageUrl}
                              alt={result.title}
                              className={cn(
                                "object-cover flex-shrink-0",
                                result.type === "course" ? "w-16 h-12 rounded" : "w-10 h-10 rounded-full"
                              )}
                            />
                          ) : (
                            <div className={cn(
                              "bg-muted flex items-center justify-center flex-shrink-0",
                              result.type === "course" ? "w-16 h-12 rounded" : "w-10 h-10 rounded-full"
                            )}>
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {result.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {result.description}
                            </div>
                            {renderCourseMetadata(result as SearchResult)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No results found for "{query}"</p>
              {hasActiveFilters && (
                <p className="text-xs mt-1">Try removing some filters</p>
              )}
              {suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs mb-2">Try searching for:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-accent transition-colors"
                        onClick={() => setQuery(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          
          {/* Keyboard hints */}
          {results.length > 0 && (
            <div className="px-3 py-2 border-t bg-muted/30 flex items-center gap-4 text-xs text-muted-foreground">
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> Select</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Close</span>
              {variant === "modal" && (
                <span className="ml-auto"><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘K</kbd> Quick search</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
