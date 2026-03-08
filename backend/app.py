import os
import io
import csv
from datetime import datetime
from pathlib import Path
from flask import Flask, jsonify, request, Response
import yaml
import sqlite3

app = Flask(__name__)

PROJECT_ROOT = Path(__file__).parent.parent

def get_bag_info(bag_path):
    bag_path = Path(bag_path)
    if not bag_path.exists():
        return None
    
    metadata_path = bag_path / "metadata.yaml"
    if metadata_path.exists():
        with open(metadata_path, 'r') as f:
            metadata = yaml.safe_load(f)
        
        rosbag_info = metadata.get('rosbag2_bagfile_information', {})
        
        topics = []
        topic_counts = rosbag_info.get('topics_with_message_count', [])
        for topic in topic_counts:
            topics.append({
                'name': topic.get('topic_metadata', {}).get('name', ''),
                'type': topic.get('topic_metadata', {}).get('type', ''),
                'count': topic.get('message_count', 0)
            })
        
        duration = rosbag_info.get('duration', {})
        duration_sec = duration.get('nanoseconds', 0) / 1e9
        
        start_ns = 0
        start_time = rosbag_info.get('starting_time', {})
        if start_time:
            start_ns = start_time.get('nanoseconds_since_epoch', 0)
            if start_ns:
                start_timestamp = start_ns / 1e9
                start_datetime = datetime.fromtimestamp(start_timestamp)
            else:
                start_datetime = None
                start_timestamp = None
        else:
            start_datetime = None
            start_timestamp = None
        
        db_path = None
        relative_paths = rosbag_info.get('relative_file_paths', [])
        if relative_paths:
            db_path = bag_path / relative_paths[0]
        
        message_count = 0
        topic_message_counts = {}
        topic_timeline = {}
        topic_sample_messages = {}
        
        if db_path and db_path.exists():
            try:
                conn = sqlite3.connect(str(db_path))
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM messages")
                message_count = cursor.fetchone()[0]
                
                cursor.execute("""
                    SELECT t.name, COUNT(m.id) 
                    FROM messages m 
                    JOIN topics t ON m.topic_id = t.id 
                    GROUP BY t.name
                """)
                for row in cursor.fetchall():
                    topic_message_counts[row[0]] = row[1]
                
                cursor.execute("""
                    SELECT t.name, m.timestamp
                    FROM messages m 
                    JOIN topics t ON m.topic_id = t.id 
                    ORDER BY m.timestamp
                """)
                for row in cursor.fetchall():
                    topic_name = row[0]
                    ts_ns = row[1]
                    if topic_name not in topic_timeline:
                        topic_timeline[topic_name] = []
                    relative_time = (ts_ns - start_ns) / 1e9 if start_ns else 0
                    topic_timeline[topic_name].append(round(relative_time, 3))
                
                cursor.execute("""
                    SELECT t.name, m.data
                    FROM messages m 
                    JOIN topics t ON m.topic_id = t.id 
                    GROUP BY t.name
                    LIMIT 3
                """)
                for row in cursor.fetchall():
                    topic_name = row[0]
                    data = row[1]
                    data_len = len(data) if data else 0
                    is_binary = isinstance(data, bytes) and data_len > 0 and data[0] < 4
                    if isinstance(data, bytes):
                        data = data.decode('utf-8', errors='replace')
                    if is_binary:
                        data = f"[Binary CDR data - {data_len} bytes - ROS2 serialized message]"
                    if topic_name not in topic_sample_messages:
                        topic_sample_messages[topic_name] = []
                    if data and len(topic_sample_messages[topic_name]) < 3:
                        topic_sample_messages[topic_name].append(data)
                
                conn.close()
            except Exception as e:
                print(f"Error reading database: {e}")
        
        return {
            'name': bag_path.name,
            'path': str(bag_path),
            'duration': duration_sec,
            'start_time': start_datetime.strftime('%Y-%m-%d %H:%M:%S') if start_datetime else None,
            'start_timestamp': start_timestamp if start_datetime else None,
            'message_count': message_count,
            'topics': topics,
            'topic_message_counts': topic_message_counts,
            'topic_timeline': topic_timeline,
            'topic_sample_messages': topic_sample_messages
        }
    return None

def scan_bags(base_path):
    base_path = Path(base_path)
    bags = []
    
    if base_path.is_file():
        parent = base_path.parent
        bags.append(get_bag_info(parent))
    elif base_path.is_dir():
        metadata_path = base_path / "metadata.yaml"
        if metadata_path.exists():
            bag_info = get_bag_info(base_path)
            if bag_info:
                bags.append(bag_info)
        else:
            for item in base_path.iterdir():
                if item.is_dir():
                    metadata = item / "metadata.yaml"
                    if metadata.exists():
                        bag_info = get_bag_info(item)
                        if bag_info:
                            bags.append(bag_info)
    
    bags = [b for b in bags if b is not None]
    bags.sort(key=lambda x: x.get('start_timestamp', 0) if x.get('start_timestamp') else 0)
    
    return bags

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        path = data.get('path', '')
        
        if not path:
            return jsonify({'error': 'Path is required'}), 400
        
        path = os.path.expanduser(path)
        
        if not os.path.isabs(path):
            path = PROJECT_ROOT / path
        
        if not os.path.exists(path):
            return jsonify({'error': f'Path does not exist: {path}'}), 400
        
        bags = scan_bags(str(path))
        
        if not bags:
            return jsonify({'error': 'No valid bag file found at the given path'}), 400
        
        return jsonify({
            'type': 'bag',
            'bags': bags,
            'count': len(bags)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare', methods=['POST'])
def compare():
    try:
        data = request.json
        paths = data.get('paths', [])
        
        all_bags = []
        for path in paths:
            path = os.path.expanduser(path)
            if not os.path.isabs(path):
                path = PROJECT_ROOT / path
            if os.path.exists(path):
                bags = scan_bags(str(path))
                all_bags.extend(bags)
        
        if not all_bags:
            return jsonify({'error': 'No valid bags found'}), 400
        
        all_bags.sort(key=lambda x: x.get('start_timestamp', 0) if x.get('start_timestamp') else 0)
        
        comparison = {
            'bags': all_bags,
            'total_bags': len(all_bags),
            'topic_overview': {},
            'timeline': []
        }
        
        for bag in all_bags:
            if bag.get('start_time'):
                comparison['timeline'].append({
                    'name': bag['name'],
                    'start_time': bag['start_time'],
                    'message_count': bag['message_count'],
                    'duration': bag['duration']
                })
            
            for topic, count in bag.get('topic_message_counts', {}).items():
                if topic not in comparison['topic_overview']:
                    comparison['topic_overview'][topic] = []
                comparison['topic_overview'][topic].append({
                    'bag': bag['name'],
                    'count': count
                })
        
        return jsonify(comparison)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export-csv', methods=['POST'])
def export_csv():
    try:
        data = request.json
        path = data.get('path', '')

        if not path:
            return jsonify({'error': 'Path is required'}), 400

        path = os.path.expanduser(path)
        if not os.path.isabs(path):
            path = PROJECT_ROOT / path

        if not os.path.exists(path):
            return jsonify({'error': f'Path does not exist: {path}'}), 400

        bags = scan_bags(str(path))
        if not bags:
            return jsonify({'error': 'No valid bag file found'}), 400

        bag = bags[0]
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'topic_name', 'topic_type', 'message_count',
            'first_timestamp_sec', 'last_timestamp_sec', 'duration_sec',
            'avg_interval_ms',
        ])

        for topic in bag.get('topics', []):
            name = topic['name']
            timeline = bag.get('topic_timeline', {}).get(name, [])

            if len(timeline) >= 2:
                first_ts = timeline[0]
                last_ts = timeline[-1]
                topic_duration = round(last_ts - first_ts, 3)
                avg_interval = round(
                    (last_ts - first_ts) / (len(timeline) - 1) * 1000, 3
                )
            elif len(timeline) == 1:
                first_ts = timeline[0]
                last_ts = timeline[0]
                topic_duration = 0
                avg_interval = 0
            else:
                first_ts = ''
                last_ts = ''
                topic_duration = ''
                avg_interval = ''

            writer.writerow([
                name,
                topic['type'],
                topic['count'],
                first_ts,
                last_ts,
                topic_duration,
                avg_interval,
            ])

        csv_content = output.getvalue()
        output.close()

        bag_name = bag.get('name', 'analysis')
        filename = f"{bag_name}_analysis.csv"

        return Response(
            csv_content,
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
