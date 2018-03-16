# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core import serializers
from django.shortcuts import render
from django.http import HttpResponse
import json
import models
import urlparse
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
def index(request):
    return HttpResponse("Hello, World!!")

def all_roasts_api(request):
    qs = request.GET
    result = {}
    try:
        result['status'] = 'ok'
        result['message'] = ''
        result['roasts'] = []
        roasts = models.Roast.objects.all().order_by('-id')
        for roast in roasts:
            roast.timestamp = str(roast.timestamp.date())
            result['roasts'].append(model_to_dict(roast))
    except Exception, e:
        result['status'] = 'error'
        result['message'] = str(e)

    return HttpResponse(json.dumps(result), content_type='application/json')

def roast_api(request):
    qs = request.GET
    result = {}
    if 'roast_id' in qs:
        result['status'] = 'ok'
        result['message'] = ''
        result['roast_info'] = model_to_dict(models.Roast.objects.get(id=qs['roast_id']))
        result['roast_info']['timestamp'] = str(result['roast_info']['timestamp'].date())
        result['data_points'] = []
        dataPoints = models.DataPoint.objects.filter(roast=qs['roast_id']).order_by('timestamp')
        if (len(dataPoints) > 0):
            start_time = dataPoints[0].timestamp
            for dp in dataPoints:
                dp.timestamp = int((dp.timestamp - start_time).total_seconds())
                result['data_points'].append(model_to_dict(dp))
            result['data_points'].reverse() 
    else:
        result['status'] = 'error'
        result['message'] = 'roast_id not specified'

    return HttpResponse(json.dumps(result), content_type='application/json')

def delete_roast_api(request):
    qs = request.GET
    result = {}
    try:
        result['status'] = 'ok'
        result['message'] = ''
        models.Roast.objects.get(id=qs['roast_id']).delete()
        
    except Exception, e:
        result['status'] = 'error'
        result['message'] = str(e)

    return HttpResponse(json.dumps(result), content_type='application/json')

@csrf_exempt
def create_roast_api(request):
    data = request.POST
    result = {}
    try:
        roast = models.Roast(coffee_type=data['coffee_type'],
                             weight=float(data['weight']),
                             roast_type=data['roast_type'])
        roast.save()
        result['status'] = 'ok'
        result['message'] = ''
        result['id'] = roast.id
    except Exception, e:
        result['status'] = 'error'
        result['message'] = str(e)
    return HttpResponse(json.dumps(result), content_type='application/json')

@csrf_exempt
def create_datapoint_api(request):
    data = request.POST
    result = {}
    try:
        dp = models.DataPoint(roast=models.Roast.objects.get(id=data['roast']))
        try:
            setattr(dp, 'element_temp', int(data['element_temp']))
        except:
            pass
        try:
            setattr(dp, 'bean_temp', int(data['bean_temp']))
        except:
            pass
        try:
            setattr(dp, 'loft_setting', float(data['loft_setting']))
        except:
            pass
        try:
            setattr(dp, 'heat_setting', float(data['heat_setting']))
        except:
            pass
        try:
            setattr(dp, 'event', data['event'])
        except:
            pass
        dp.save()
        result['status'] = 'ok'
        result['message'] = ''
        result['id'] = dp.id
    except Exception as e:
        result['status'] = 'error'
        result['message'] = str(e)
    return HttpResponse(json.dumps(result), content_type='application/json')
