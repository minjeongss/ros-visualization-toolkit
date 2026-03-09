import os

from flask import Blueprint, Response, jsonify, request

from .services import (
    build_comparison,
    build_csv,
    resolve_path,
    scan_bags,
)

api_bp = Blueprint('api', __name__)


@api_bp.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        path = data.get('path', '')

        if not path:
            return jsonify({'error': 'Path is required'}), 400

        path = resolve_path(path)

        if not os.path.exists(path):
            return jsonify({'error': f'Path does not exist: {path}'}), 400

        bags = scan_bags(path)

        if not bags:
            return jsonify({
                'error': 'No valid bag file found at the given path'
            }), 400

        return jsonify({
            'type': 'bag',
            'bags': bags,
            'count': len(bags)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/compare', methods=['POST'])
def compare():
    try:
        data = request.json
        paths = data.get('paths', [])

        all_bags = []
        for p in paths:
            resolved = resolve_path(p)
            if os.path.exists(resolved):
                bags = scan_bags(resolved)
                all_bags.extend(bags)

        if not all_bags:
            return jsonify({'error': 'No valid bags found'}), 400

        comparison = build_comparison(all_bags)
        return jsonify(comparison)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/export-csv', methods=['POST'])
def export_csv():
    try:
        data = request.json
        path = data.get('path', '')

        if not path:
            return jsonify({'error': 'Path is required'}), 400

        path = resolve_path(path)

        if not os.path.exists(path):
            return jsonify({'error': f'Path does not exist: {path}'}), 400

        bags = scan_bags(path)
        if not bags:
            return jsonify({'error': 'No valid bag file found'}), 400

        bag = bags[0]
        csv_content = build_csv(bag)

        bag_name = bag.get('name', 'analysis')
        filename = f"{bag_name}_analysis.csv"

        return Response(
            csv_content,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
