'''
Business: Admin panel for managing user balances and statistics
Args: event with httpMethod, body (action, password, user_id, amount)
Returns: HTTP response with user list or update confirmation
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

ADMIN_PASSWORD = "alfa2024admin"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            password = params.get('password', '')
            
            if password != ADMIN_PASSWORD:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный пароль администратора'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, email, full_name, balance, referral_count, created_at FROM users ORDER BY created_at DESC"
                )
                users = cur.fetchall()
                
                users_list = []
                for user in users:
                    users_list.append({
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'balance': float(user['balance']),
                        'referral_count': user['referral_count'],
                        'created_at': user['created_at'].isoformat() if user['created_at'] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'users': users_list
                    })
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            password = body_data.get('password', '')
            
            if password != ADMIN_PASSWORD:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный пароль администратора'})
                }
            
            if action == 'update_balance':
                user_id = body_data.get('user_id')
                amount = body_data.get('amount')
                
                if not user_id or amount is None:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User ID и сумма обязательны'})
                    }
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "UPDATE users SET balance = balance + %s WHERE id = %s RETURNING id, email, full_name, balance, referral_count",
                        (amount, user_id)
                    )
                    conn.commit()
                    user = cur.fetchone()
                    
                    if not user:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Пользователь не найден'})
                        }
                    
                    user_data = {
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'balance': float(user['balance']),
                        'referral_count': user['referral_count']
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'success': True,
                            'user': user_data
                        })
                    }
            
            elif action == 'set_balance':
                user_id = body_data.get('user_id')
                balance = body_data.get('balance')
                
                if not user_id or balance is None:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User ID и баланс обязательны'})
                    }
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "UPDATE users SET balance = %s WHERE id = %s RETURNING id, email, full_name, balance, referral_count",
                        (balance, user_id)
                    )
                    conn.commit()
                    user = cur.fetchone()
                    
                    if not user:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Пользователь не найден'})
                        }
                    
                    user_data = {
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'balance': float(user['balance']),
                        'referral_count': user['referral_count']
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'success': True,
                            'user': user_data
                        })
                    }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        conn.close()
