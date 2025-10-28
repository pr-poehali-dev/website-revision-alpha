'''
Business: User registration and login with balance tracking
Args: event with httpMethod, body (email, password, full_name for register)
Returns: HTTP response with user data or error message
'''
import json
import hashlib
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    try:
        if action == 'register':
            email = body_data.get('email')
            password = body_data.get('password')
            full_name = body_data.get('full_name')
            
            if not email or not password or not full_name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Все поля обязательны'})
                }
            
            hashed_pwd = hash_password(password)
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id FROM users WHERE email = %s",
                    (email,)
                )
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email уже зарегистрирован'})
                    }
                
                cur.execute(
                    "INSERT INTO users (email, password, full_name) VALUES (%s, %s, %s) RETURNING id, email, full_name, balance, referral_count",
                    (email, hashed_pwd, full_name)
                )
                conn.commit()
                user = cur.fetchone()
                
                referral_code = f"REF{user['id']:06d}"
                cur.execute(
                    "UPDATE users SET referral_code = %s WHERE id = %s",
                    (referral_code, user['id'])
                )
                conn.commit()
                
                user_data = {
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'balance': float(user['balance']),
                    'referral_count': user['referral_count'],
                    'referral_code': referral_code
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
        
        elif action == 'login':
            email = body_data.get('email')
            password = body_data.get('password')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и пароль обязательны'})
                }
            
            hashed_pwd = hash_password(password)
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, email, full_name, balance, referral_count, referral_code FROM users WHERE email = %s AND password = %s",
                    (email, hashed_pwd)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'})
                    }
                
                user_data = {
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'balance': float(user['balance']),
                    'referral_count': user['referral_count'],
                    'referral_code': user['referral_code'] or f"REF{user['id']:06d}"
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
    
    finally:
        conn.close()