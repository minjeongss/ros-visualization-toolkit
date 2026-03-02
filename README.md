# Ros Visualization Toolkit

## topic monitor: save csv version

### ROS2 Terminal

```
docker exec -it ros2_dev bash
ros2 bag play bag/(*)
```

### Monitor Terminal

```
docker exec -it ros2_dev bash
python3 topic_monitor_save_one_csv.py
python3 topic_monitor_save_part_csv.py
```

## topic monitor: terminal print version

### ROS2 Terminal

```
docker exec -it ros2_dev bash
ros2 bag play bag/(*)
```

### Monitor Terminal

```
docker exec -it ros2_dev bash
python3 topic_monitor_terminal_print.py
```
