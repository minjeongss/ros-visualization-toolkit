import { useMemo, useState } from "react";
import type {
  BagData,
  Topic,
  MessageCountItem,
  PieDataItem,
  TimelineEntry,
  FirstMessageItem,
} from "../types";
import StatsGrid from "./StatsGrid";
import MessageCountChart from "./MessageCountChart";
import TopicDistributionChart from "./TopicDistributionChart";
import TimelineChart from "./TimelineChart";
import TopicArrivalOrder from "./TopicArrivalOrder";
import TopicTypeGroups from "./TopicTypeGroups";
import TopicDetailList from "./TopicDetailList";
import TopicPlayback from "./TopicPlayback";

interface BagResultsProps {
  bags: BagData[];
  bagPath: string;
  expandedTopic: string | null;
  onToggleTopic: (topic: string) => void;
}

function BagResults({
  bags,
  bagPath,
  expandedTopic,
  onToggleTopic,
}: BagResultsProps) {
  const bag = bags[0];
  const allTopics = bag.topics || [];
  const [exporting, setExporting] = useState(false);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: bagPath }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition");
      const filename =
        disposition?.match(/filename="(.+)"/)?.[1] ?? "analysis.csv";
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("CSV 내보내기에 실패했습니다.");
    }
    setExporting(false);
  };

  const messageCountData: MessageCountItem[] = useMemo(
    () =>
      allTopics
        .map((t) => ({
          name: t.name.replace("/", ""),
          fullName: t.name,
          count: t.count,
          type: t.type.split("/").pop()!,
        }))
        .sort((a, b) => b.count - a.count),
    [allTopics],
  );

  const pieData: PieDataItem[] = useMemo(
    () =>
      messageCountData.slice(0, 8).map((item) => ({
        name: item.name,
        value: item.count,
      })),
    [messageCountData],
  );

  const timelineData: TimelineEntry[] = useMemo(() => {
    const entries = Object.entries(bag.topic_timeline || {});
    return entries.slice(0, 6).map(([topic, times]) => {
      const buckets: Record<number, number> = {};
      const step = bag.duration / 30;
      times.forEach((t) => {
        const bucket = Math.floor(t / step);
        buckets[bucket] = (buckets[bucket] || 0) + 1;
      });
      return {
        topic: topic.replace("/", ""),
        fullTopic: topic,
        buckets: Array.from({ length: 30 }, (_, i) => ({
          time: (i * step).toFixed(1),
          count: buckets[i] || 0,
        })),
      };
    });
  }, [bag.topic_timeline, bag.duration]);

  const timelineChartData = useMemo(() => {
    if (timelineData.length === 0) return [];
    return timelineData[0].buckets.map((b, i) => {
      const point: Record<string, string | number> = { time: b.time };
      timelineData.forEach((td) => {
        point[td.topic] = td.buckets[i].count;
      });
      return point;
    });
  }, [timelineData]);

  const firstMessages: FirstMessageItem[] = useMemo(
    () =>
      Object.entries(bag.topic_timeline || {})
        .map(([topic, times]) => ({
          topic,
          topicShort: topic.replace("/", ""),
          firstTime: times.length > 0 ? times[0] : null,
          lastTime: times.length > 0 ? times[times.length - 1] : null,
          totalCount: times.length,
        }))
        .filter((t) => t.firstTime !== null)
        .sort((a, b) => a.firstTime! - b.firstTime!),
    [bag.topic_timeline],
  );

  const groupedTopics: Record<string, Topic[]> = useMemo(() => {
    const groups: Record<string, Topic[]> = {};
    allTopics.forEach((t) => {
      const type = t.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(t);
    });
    return groups;
  }, [allTopics]);

  return (
    <div className="results">
      <StatsGrid
        messageCount={bag.message_count}
        duration={bag.duration}
        topicCount={allTopics.length}
        firstMessage={firstMessages[0]}
      />
      <div className="export-row">
        <button
          className="btn-primary"
          onClick={exportCSV}
          disabled={exporting}
        >
          {exporting ? "내보내는 중..." : "CSV 다운로드"}
        </button>
      </div>
      <TopicPlayback
        duration={bag.duration}
        topicTimeline={bag.topic_timeline}
        topics={allTopics}
      />
      <TimelineChart
        timelineData={timelineData}
        chartData={timelineChartData}
      />
      <TopicArrivalOrder
        firstMessages={firstMessages}
        expandedTopic={expandedTopic}
        onToggleTopic={onToggleTopic}
      />
      <MessageCountChart data={messageCountData} />
      <TopicDistributionChart data={pieData} />
      <TopicTypeGroups
        groupedTopics={groupedTopics}
        expandedTopic={expandedTopic}
        onToggleTopic={onToggleTopic}
      />
      <TopicDetailList
        topics={allTopics}
        bag={bag}
        expandedTopic={expandedTopic}
        onToggleTopic={onToggleTopic}
      />
    </div>
  );
}

export default BagResults;
